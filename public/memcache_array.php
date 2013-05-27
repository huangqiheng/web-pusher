<?php

require_once 'memcached_namespace.php';

define('LIST_NAME_KEY', 'list_name_key');
define('LIST_KEY2ID_PREFIX', 'list_key2id_');
define('LIST_ID2KEY_PREFIX', 'list_id2key_');
define('LIST_KEYVALUE_PREFIX', 'list_keyvalue_');
define('LIST_LENGTH_KEY', 'list_length_key');

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

	$ok = $mem->ns_add($list_name, LIST_KEY2ID_PREFIX.$key, time());
	if ($ok) {
		$index = __new_index($mem, $list_name);
		$mem->ns_set($list_name, LIST_ID2KEY_PREFIX.$index, $key); 
		//如果是第一个元素，则返回提示true
		$result = ($index==1)? true : false;
	} else {
		$mem->ns_set($list_name, LIST_KEY2ID_PREFIX.$key, time());
	}

	$mem->ns_set($list_name, LIST_KEYVALUE_PREFIX.$key, $value, $expired);
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

function mmc_array_del($list_name, $key)
{
	$mem = __open_mmc();
	return $mem->ns_delete($list_name, LIST_KEYVALUE_PREFIX.$key);
}

function make_data_keys($item)
{
	return LIST_KEYVALUE_PREFIX.$item;
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
	$length = $mem->ns_get($list_name, LIST_LENGTH_KEY);

	$del_ids = [];
	for ($index=1; $index<=$length; $index++) {
		$index_key = LIST_ID2KEY_PREFIX.$index;
		$key = $mem->ns_get($list_name, $index_key);
		$last_active_time = $mem->ns_get($list_name, LIST_KEY2ID_PREFIX.$key);

		if ($last_active_time < $before_time) {
			$del_ids[] = $index;
		}
	}

	if (count($del_ids) == 0) {
		return 0;
	}

	$del_count = 0;
	for ($index=$length; $index>0; $index--) {
		if (count($del_ids) == 0) {
			break;
		}

		$key = $mem->ns_get($list_name, LIST_ID2KEY_PREFIX.$index);
		if (in_array($index, $del_ids)) {
			$pos = array_search($index, $del_ids);
			array_splice($del_ids, $pos, 1);
		} else {
			$pop_index = array_pop($del_ids);
			$mem->ns_set($list_name, LIST_ID2KEY_PREFIX.$pop_index, $key);
		}

		$mem->ns_decrement($list_name, LIST_LENGTH_KEY);
		$mem->ns_delete($list_name, LIST_KEY2ID_PREFIX.$key);
		$del_count++;
	}

	return $del_count;
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
	$id_values = array_values($indexs);
	$keys = array_map('make_data_keys', $id_values);

	$indexs = $mem->ns_getMulti($list_name, $keys);
	$returns = [];
	foreach ($indexs as $key=>$value) {
		if (preg_match("/^".LIST_KEYVALUE_PREFIX."([\S]+$)/", $key, $matchs)) {
			$returns[$matchs[1]] = $value;
		}
	}

	return $returns;
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
