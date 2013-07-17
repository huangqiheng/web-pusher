<?php
require_once 'functions.php';

//if (!is_from_async()) {die();}
if (!is_sched_changed()) {die();}

//获得管理端UI所生成的配置列表
$sched_list   = mmc_array_all_cache(DATA_SCHED_LIST);
$users_list   = mmc_array_all_cache(DATA_USER_LIST);
$message_list = mmc_array_all_cache(DATA_MESSAGE_LIST);

//生成新的配置，并同步给设备去识别
$new_sched_list = make_new_sched_list($sched_list, $users_list, $message_list);
$del_sched_list = array_diff_key(used_sched_list(), $new_sched_list);
update_new_sched_list($new_sched_list, $del_sched_list);

//---------------------------------------------------------------------

function mmc_array_all_cache($name)
{
	$list = mmc_array_all($name);
	$file_name = __DIR__.'/cache/'.$name.'.cache';

	if (count($list) === 0) {
		$list = unserialize(file_get_contents($file_name));
		if (empty($list)) {
			return array();
		}
		foreach ($list as $key=>$value) {
			mmc_array_set($name, $key, $value);
		}
	} else {
		file_put_contents($file_name, serialize($list));
	}

	return $list;
}

function update_new_sched_list($new_sched_list, $del_sched_list)
{
	//逐条更新到memcached数组中
	foreach ($new_sched_list as $key=>$value) {
		mmc_array_set(NS_SCHED_TASKS, $key, $value, $value['finish_time']);
	}

	//这是分发任务用的cache列表，更新之
	used_sched_list($new_sched_list);

	//将需要删除的清除掉，让设备不再能够“读取”从而禁止规则执行
	foreach ($del_sched_list as $key=>$value) {
		mmc_array_del(NS_SCHED_TASKS, $key);
	}
}

function used_sched_list($new_list=null)
{
	$mem = api_open_mmc();
	if ($new_list) {
		return $mem->set(KEY_SCHED_LIST, $new_list);
	} else {
		$result = $mem->get(KEY_SCHED_LIST);
		(!$result) && ($result=array());
		return $result;
	}
}

function trans_time($time_str)
{
	return strtotime(preg_replace('/\(.+\)/', '',  $time_str));
}

function make_new_sched_list($sched_list, $users_list, $message_list)
{
	$result = array();
	foreach ($sched_list as $name=>$task) {
		$new_target = get_user_selected($users_list, $task['target_device']);
		$new_message = get_user_selected($message_list, $task['sched_msg']);

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
			$names[] = $key;
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
			if ($key == $name) {
				$result[] = $item;
			}
		}
	}

	return $result;
}


/*
	sched_list
{name: 'name', type: 'string'},
{name: 'status', type: 'string'},
{name: 'start_time', type: 'date'},
{name: 'finish_time', type: 'date'},
{name: 'times', type: 'string'},
{name: 'time_interval', type: 'string'},
{name: 'time_interval_mode', type: 'string'},
{name: 'msg_sequence', type: 'string'},
{name: 'repel', type: 'string'},
{name: 'target_device', type: 'string'},
{name: 'sched_msg', type: 'string'}

	users_list
{name: 'name', type: 'string'},
{name: 'tags', type: 'string'},
{name: 'new_user', type: 'string'},
{name: 'new_visitor', type: 'string'},
{name: 'ismobiledevice', type: 'string'},
{name: 'binded', type: 'string'},
{name: 'browser', type: 'string'},
{name: 'platform', type: 'string'},
{name: 'device_name', type: 'string'},
{name: 'UserAgent', type: 'string'},
{name: 'region', type: 'string'},
{name: 'bind_account', type: 'string'},
{name: 'Visiting', type: 'string'}

	message_list
{name: 'name', type: 'string'},
{name: 'tags', type: 'string'},
{name: 'title', type: 'string'},
{name: 'text', type: 'string'},
{name: 'msgmod', type: 'string'},
{name: 'position', type: 'string'},
{name: 'sticky', type: 'string'},
{name: 'time', type: 'string'},
{name: 'before_open', type: 'string'}

*/

?>
