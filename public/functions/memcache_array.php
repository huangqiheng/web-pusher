<?php

require_once 'memcached_namespace.php';

define('LIST_NAME_KEY', 'list_name_key');
define('LIST_KEY2TIME_PREFIX', 'list_key2time_');
define('LIST_ID2KEY_PREFIX', 'list_id2key_');
define('LIST_KEYVALUE_PREFIX', 'list_keyvalue_');
define('LIST_LENGTH_KEY', 'list_length_key');
define('LIST_LOCK', 1);
define('LIST_LOCK_KEY', 'list_lock_key');
define('LIST_LOCK_TIME', 5);

define('MEMC_POOL', 'memcached_pool');

function __new_index($mem, $list_name)
{
	$index = $mem->ns_increment($list_name, LIST_LENGTH_KEY);
	if (empty($index)) {
		$index = 1;
		$mem->ns_set($list_name, LIST_LENGTH_KEY, $index, 0);
	}
	return $index;
}

function __open_mmc()
{
	$mem = new NSMemcached(MEMC_POOL);
	$ss = $mem->getServerList();
	if (empty($ss)) {
		$mem->addServer(MEMC_HOST, MEMC_PORT);
	}
	return $mem;
}

function mmc_array_set($list_name, $key, $value, $expired=0)
{
	$mem = __open_mmc();
	$result = false;

	$time_ok = $mem->ns_replace($list_name, LIST_KEY2TIME_PREFIX.$key, time());
	if ($time_ok === false) {
		$index = __new_index($mem, $list_name);
		$mem->ns_set($list_name, LIST_ID2KEY_PREFIX.$index, $key); 
		$mem->ns_set($list_name, LIST_KEY2TIME_PREFIX.$key, time());
		//返回1，表示这是系统启动以来的第一个上线
		//返回2，表示这是系统启动以来了，某设备第一次上线
		$result = ($index==1)? 1 : 2;
	}

	$value_ok = $mem->ns_replace($list_name, LIST_KEYVALUE_PREFIX.$key, $value, $expired);
	if ($value_ok === false) {
		$mem->ns_set($list_name, LIST_KEYVALUE_PREFIX.$key, $value, $expired);
		//返回3，表示这是某设备超时后，再次上线
		$result = 3;
	}
	return $result;
}

function mmc_array_caption($list_name, $caption=null)
{ 
	$mem = __open_mmc();
	if (empty($caption)) {
		$result = $mem->ns_get($list_name, LIST_NAME_KEY);
	} else {
		$result = $mem->ns_set($list_name, LIST_NAME_KEY, $caption, 0); 
	}
	return $result;
}

function mmc_array_get($list_name, $key)
{
	$mem = __open_mmc();
	return $mem->ns_get($list_name, LIST_KEYVALUE_PREFIX.$key);
}

function mmc_array_gets($list_name, $keys)
{
	$mem = __open_mmc();
	$keys2 = array_map('make_data_keys', $keys);
	$indexs = $mem->ns_getMulti($list_name, $keys2);

	$returns = [];
	foreach ($indexs as $key=>$value) {
		if (preg_match("/^".LIST_KEYVALUE_PREFIX."([\S]+$)/", $key, $matchs)) {
			$returns[$matchs[1]] = $value;
		}
	}

	return $returns;
}

function mmc_array_del($list_name, $key)
{
	$mem = __open_mmc();
	return $mem->ns_delete($list_name, LIST_KEYVALUE_PREFIX.$key);
}

function make_data_keys($item)
{
	return is_string($item)? LIST_KEYVALUE_PREFIX.$item : '';
}

function mmc_array_length($list_name)
{
	$mem = __open_mmc();
	$return = $mem->ns_get($list_name, LIST_LENGTH_KEY);
	return empty($return)? 0 : $return;
}

function mmc_array_cleanup($list_name, $before_time)
{
	$mem = __open_mmc();

	//预处理，获取需要删除的元素列表
	$length = $mem->ns_get($list_name, LIST_LENGTH_KEY);
	$del_ids = [];
	$del_key2time = [];
	for ($index=1; $index<=$length; $index++) {
		$index_key = LIST_ID2KEY_PREFIX.$index;
		$key = $mem->ns_get($list_name, $index_key);
		$key2time = LIST_KEY2TIME_PREFIX.$key;
		$keydata_key = LIST_KEYVALUE_PREFIX.$key;

		if ($mem->ns_get($list_name, $keydata_key)) {
			continue;
		}

		$last_active_time = $mem->ns_get($list_name, $key2time);
		if ($last_active_time < $before_time) {
			$del_ids[] = $index_key;
			$del_key2time[] = $key2time;
		}
	}

	$del_count = count($del_ids);
	if ($del_count == 0) {
		return 0;
	}

	//信号锁
	defined('LIST_LOCK') && $mem->ns_set($list_name, LIST_LOCK_KEY, 1, LIST_LOCK_TIME);

	//将末尾长度迅速剪下来
	$length = $mem->ns_get($list_name, LIST_LENGTH_KEY);
	$mem->ns_set($list_name, LIST_LENGTH_KEY, $length-$del_count);

	//删除末尾的
	$keys_todel = array();
	for ($index=$length; $del_count>0; $index--,$del_count--) {
		$keys_todel[] = LIST_ID2KEY_PREFIX.$index;
	}
	$cutoffs = $mem->ns_cutMulti($list_name, $keys_todel);

	//然后慢慢填回去，先找出没重叠的需要填回去的
	$to_fill_values = array();
	foreach ($cutoffs as $key=>$value) {
		if ($pos = array_search($key, $del_ids)) {
			array_splice($del_ids, $pos, 1);
		} else {
			$to_fill_values[] = $value;
		}
	}

	//收集起来后一次过填回去
	$to_sets = array();
	foreach ($to_fill_values as $value) {
		$to_sets[array_pop($del_ids)] = $value;
	}
	$mem->ns_setMulti($list_name, $to_sets);

	//删除key to time列表，这样被删除的index就能增加了，避免index列表的从复
	//key to time 列表是用来保证index列表不从复元素的
	$mem->ns_deleteMulti($list_name, $del_key2time);

	defined('LIST_LOCK') && $mem->ns_delete($list_name, LIST_LOCK_KEY);
	return count($del_key2time);
}


function mmc_array_clear($list_name)
{
	$mem = __open_mmc();
	$length = $mem->ns_get($list_name, LIST_LENGTH_KEY);

	if (empty($length)) {
		$mem->ns_flush($list_name);
		return;
	}

	$index_keys = [];
	for ($index=1; $index<=$length; $index++) {
		$index_keys[] = LIST_ID2KEY_PREFIX.$index;
	}

	$indexs = $mem->ns_getMulti($list_name, $index_keys);
	$id_values = array_unique(array_values($indexs));

	$key_keyval = [];
	$key_keytime = [];
	foreach ($id_values as $key) {
		$key_keyval[] = LIST_KEYVALUE_PREFIX.$key;
		$key_keytime[] = LIST_KEY2TIME_PREFIX.$key;
	}

	$mem->ns_deleteMulti($list_name, $index_keys); 
	$mem->ns_deleteMulti($list_name, $key_keyval); 
	$mem->ns_deleteMulti($list_name, $key_keytime); 
	$mem->ns_delete($list_name, LIST_LENGTH_KEY);

	$mem->ns_flush($list_name);
}

function mmc_array_all($list_name)
{
	$mem = __open_mmc();
	$length = $mem->ns_get($list_name, LIST_LENGTH_KEY);

	$index_keys = [];
	for ($index=1; $index<=$length; $index++) {
		$index_keys[] = LIST_ID2KEY_PREFIX.$index;
	}

	$indexs = $mem->ns_getMulti($list_name, $index_keys);
	$id_values = array_unique(array_values($indexs));

	return mmc_array_gets($list_name, $id_values);
}

function mmc_array_keys($list_name)
{
	$all = mmc_array_all($list_name);
	return array_keys($all);
}

function mmc_array_values($list_name)
{
	$all = mmc_array_all($list_name);
	return array_values($all);
}

?>
