<?php
require_once 'functions.php';
require_once 'functions/onebox.php';

$is_debug = false;

if (isset($_GET['force'])) {
	$is_debug = true;
	update_sched_tasks();
	die();
}

function dbg_print($obj)
{
	global $is_debug;
	if ($is_debug) {
		print_r2($obj);
	}
}

function update_sched_tasks($listname='all')
{
	//获得管理端UI所生成的配置列表
	if ($listname === 'all') {
		$popup_list     = mmc_array_all_cache(DATA_SCHED_LIST);
		$users_list     = mmc_array_all_cache(DATA_USER_LIST);
		$message_list   = mmc_array_all_cache(DATA_MESSAGE_LIST);
		$replace_list   = mmc_array_all_cache(DATA_PLANS_LIST);
		$posi_list      = mmc_array_all_cache(DATA_POSI_LIST);
		$identify_list  = mmc_array_all_cache(DATA_IDENTIFY_LIST);
dbg_print($users_list);
		//生成新的配置，并同步给设备去识别
		$new_popup_list = make_new_popup_list($popup_list, $users_list, $message_list);
		update_new_popup_list($new_popup_list);

		$new_replace_list = make_new_replace_list($replace_list, $users_list, $message_list, $posi_list);
		update_new_replace_list($new_replace_list);

		make_new_identify_file($posi_list, $identify_list);
	} else {
		mmc_array_all_cache($listname);
	}
}

//---------------------------------------------------------------------

function make_new_identify_file($posi_list, $identify_list)
{
	$posi_sav = [];
	foreach($posi_list as $key=>$posi) {
		$new_posi = [];
		$new_posi['key'] = $key;
		$new_posi['urls'] = explode(',', $posi['urls']);
		$new_posi['selectors'] = explode(',', $posi['selectors']);
		$new_posi['insert'] = $posi['insert'];
		$new_posi['action'] = $posi['action'];
		$posi_sav[] = $new_posi;
	}

	$ident_sav = [];
	foreach($identify_list as $key=>$ident) {
		if ($ident['active'] !== 'true') {
			continue;
		}
		$name = $ident['platform'];
		$old_item = null;
		foreach($ident_sav as &$item) {
			if ($item['name'] == $name) {
				$old_item = $item;
				break;
			}
		}

		$user_obj = [];
		$user_obj['selector'] = $ident['username-selector'];
		$user_obj['revisor'] = $ident['username-revisor'];
		$user_obj = (object)$user_obj;

		$nick_obj = [];
		$nick_obj['selector'] = $ident['nickname-selector'];
		$nick_obj['revisor'] = $ident['nickname-revisor'];
		$nick_obj = (object)$nick_obj;

		if (empty($old_item)) {
			$new_ident = [];
			$new_ident['name'] = $name;
			$new_ident['caption'] = $ident['caption'];
			$new_ident['hosts'] = [$ident['host']];

			if (empty($user_obj->selector)) {
				$new_ident['username'] = [];
			} else {
				$new_ident['username'] = [$user_obj];
			}

			if (empty($nick_obj->selector)) {
				$new_ident['nickname'] = [];
			} else {
				$new_ident['nickname'] = [$nick_obj];
			}

			$ident_sav[] = $new_ident;
		} else {
			$hosts = $old_item['host'];
			if (!in_array($ident['host'], $hosts)) {
				$hosts[] = $ident['host'];
			}

			if (!empty($user_obj->selector)) {
				$old_item['username'][] = $user_obj;
			}

			if (!empty($nick_obj->selector)) {
				$old_item['nickname'][] = $nick_obj;
			}
		}
	}

	$posi_str  = 'var posi_configs = '.indent(json_encode($posi_sav)).';';
	$ident_str = 'var ident_configs = '.indent(json_encode($ident_sav)).';';

	$src_identify_js = __DIR__.'/js/identify.js';
	$src_identify_content =  file_get_contents($src_identify_js);
	$new_content = preg_replace('/main\(\);}\)\(\);}/i', '', $src_identify_content);
	$new_content .= $posi_str."\n\n";
	$new_content .= $ident_str."\n\n";
	$new_content .= 'main();})();}';

	$identify_js = get_cached_path().'identify.js';
	file_put_contents($identify_js, $new_content);
}


function update_new_replace_list($new_replace_list)
{
	//找出需要删除的
	$del_replace_list = array_diff_key(using_tasks_list(KEY_PLANS_LIST), $new_replace_list);

	//逐条更新到memcached数组中
	$use_replace_list = [];
	foreach ($new_replace_list as $key=>$value) {
		if (time() < $value['finish_time']) {
			$use_replace_list[$key] = $value;
			mmc_array_set(NS_PLANS_TASKS, $key, $value, $value['finish_time']);
		}
	}

	//这是分发任务用的cache列表，更新之
	using_tasks_list(KEY_PLANS_LIST, $use_replace_list);

	//将需要删除的清除掉，让设备不再能够“读取”从而禁止规则执行
	foreach ($del_replace_list as $key=>$value) {
		mmc_array_del(NS_PLANS_TASKS, $key);
	}
}

function update_new_popup_list($new_sched_list)
{
	//找出需要删除的
	$old_sched_list = using_tasks_list(KEY_SCHED_LIST);
	$del_sched_list = array_diff_key($old_sched_list, $new_sched_list);

	//逐条更新到memcached数组中
	$use_sched_list = [];
	foreach ($new_sched_list as $key=>$value) {
		if (time() < $value['finish_time']) {
			$use_sched_list[$key] = $value;
			mmc_array_set(NS_SCHED_TASKS, $key, $value, $value['finish_time']);
		}
	}

	//这是分发任务用的cache列表，更新之
	using_tasks_list(KEY_SCHED_LIST, $use_sched_list);

	//将需要删除的清除掉，让设备不再能够“读取”从而禁止规则执行
	foreach ($del_sched_list as $key=>$value) {
		mmc_array_del(NS_SCHED_TASKS, $key);
	}
}

function get_cached_path()
{
	return __DIR__.'/cache/';
}

function get_cached_filename($name)
{
	return get_cached_path().$name.'.cache';
}

function del_cached_file($name)
{
	$filename = get_cached_filename($name);
	return unlink($filename);
}

function mmc_array_all_cache($name)
{
	$list = mmc_array_all($name);

	//清理异常记录
	
	foreach ($list as $key=>&$value) {
		if (@$value['name'] === '') {
			mmc_array_del($name, $key);
			loglocal('del '.$key);
			loglocal($value);
			unset($list[$key]);
		}

		if (array_key_exists('finish_time', $value)) {
			$finish_time = trans_time($value['finish_time']);
			if (time() >= $finish_time) {
				$value['status'] = 'timeout';
				mmc_array_set($name, $key, $value);
			}
		}
	}

	$file_name = get_cached_filename($name);

	if (count($list) === 0) {
		if (file_exists($file_name)) {
			$list = unserialize(file_get_contents($file_name));
			if (empty($list)) {
				return array();
			}
		} else {
			return array();
		}

		mmc_array_clear($name);
		foreach ($list as $key=>$value) {
			$res = mmc_array_set($name, $key, $value);
		}
	} else {
		file_put_contents($file_name, serialize($list));
	}

	return $list;
}

function using_tasks_list($cache_key, $new_list=null)
{
	$mem = api_open_mmc();
	if ($new_list === null) {
		$result = $mem->get($cache_key);
		(!$result) && ($result=array());
		return $result;
	} else {
		return $mem->set($cache_key, $new_list);
	}
}


function trans_time($time_str)
{
	return strtotime(preg_replace('/\(.+\)/', '',  $time_str));
}

function onebox_cached($content)
{
	$mem = api_open_mmc();
	$result = $mem->ns_get(NS_ONEBOX_CACHE, md5($content));
	if (empty($result)) {
		$result = make_onebox_appgame($content);
		$mem->ns_set(NS_ONEBOX_CACHE, md5($content), $result);
	}
	return $result;
}

function make_new_popup_list($sched_list, $users_list, $message_list)
{
	$result = array();
	foreach ($sched_list as $name=>$task) {
		$target_device = @$task['target_device'];
		$target_messages = @$task['sched_msg'];

		if (empty($target_device)) {continue;}
		if (empty($target_messages)) {continue;}

		$new_target = get_user_selected($users_list, $target_device);
		$pick_message = get_user_selected($message_list, $target_messages);

		$new_message = [];
		foreach ($pick_message as &$item) {
			$item['text'] = onebox_cached($item['text']);
			if ($item['msgform'] === 'popup') {
				$new_message[] = $item;
			}
		}

		$new = array();
		$new['targets'] = $new_target;
		$new['messages'] = $new_message;
		$new_task = array_merge($task, $new);

		$new_task['start_time'] = trans_time($new_task['start_time']);
		$new_task['finish_time'] = trans_time($new_task['finish_time']);
		$new_task['times'] = intval($new_task['times']);
		$new_task['time_interval'] = intval($new_task['time_interval']);
		$result[$name] = $new_task;
	}

	return $result;
}

function make_new_replace_list($replace_list, $users_list, $message_list, $posi_list)
{
	$result = array();
	foreach ($replace_list as $name=>$task) {
		$target_device = @$task['target_device'];
		$target_messages = @$task['replace_msg'];

		if (empty($target_device)) {continue;}
		if (empty($target_messages)) {continue;}

		$new_target = get_user_selected($users_list, $target_device);
		$pick_message = get_user_selected($message_list, $target_messages);

		$new_message = [];
		foreach ($pick_message as &$item) {
			$item['text'] = onebox_cached($item['text']);
			if ($item['msgform'] === 'replace') {
				$item['position'] = md5($item['position']);
				$new_message[] = $item;
			}
		}
		
		$new = array();
		$new['targets'] = $new_target;
		$new['messages'] = $new_message;
		$new_task = array_merge($task, $new);

		$new_task['start_time'] = trans_time($new_task['start_time']);
		$new_task['finish_time'] = trans_time($new_task['finish_time']);
		$new_task['times'] = intval($new_task['times']);
		$new_task['interval'] = intval($new_task['interval']);
		$new_task['interval_pre'] = intval($new_task['interval_pre']);
		$result[$name] = $new_task;
	}

	return $result;
}

function get_tag_name($value) {
	if (preg_match('/^\[(.+)\]$/', $value, $matchs)) {
		return $matchs[1];
	}
	return null;
}

function tag2names($list, $tag_name)
{
	$names = array();
	foreach ($list as $key=>$item) {
		if (strpos($item['tags'], $tag_name) !== false) {
			$names[] = $item['name'];
		}
	}
	return $names;
}

function get_user_selected($list, $user_selected)
{
	$item_names = array();
	$targets = explode(',', $user_selected);
	foreach($targets as $value) {
		$tag_name = get_tag_name($value);
		if ($tag_name) {
			$names = tag2names($list, $tag_name);
			foreach($names as $name) {
				if (!in_array($name, $item_names)) {
					$item_names[] = $name;
				}
			}
		} else {
			if (!in_array($value, $item_names)) {
				$item_names[] = $value;
			}
		}
	}

	$result = array();
	foreach($item_names as $name) {
		foreach ($list as $key=>$item) {
			if ($item['name']== $name) {
				$result[] = $item;
			}
		}
	}

	return $result;
}


?>
