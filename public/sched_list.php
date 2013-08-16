<?php
require_once 'functions.php';
require_once 'functions/onebox.php';

if (isset($_GET['force'])) {
	update_sched_tasks();
}

function update_sched_tasks($listname='all')
{
	//获得管理端UI所生成的配置列表
	if ($listname === 'all') {
		$sched_list   = mmc_array_all_cache(DATA_SCHED_LIST);
		$users_list   = mmc_array_all_cache(DATA_USER_LIST);
		$message_list = mmc_array_all_cache(DATA_MESSAGE_LIST);
		$plans_list = mmc_array_all_cache(DATA_PLANS_LIST);
		$posi_list = mmc_array_all_cache(DATA_POSI_LIST);

		//生成新的配置，并同步给设备去识别
		$new_tasks_list = make_new_tasks_list($sched_list, $users_list, $message_list);
		$del_sched_list = array_diff_key(used_sched_list(), $new_tasks_list);
		update_new_tasks_list($new_tasks_list, $del_sched_list);
	} else {
		mmc_array_all_cache($listname);
	}
}

//---------------------------------------------------------------------

function update_new_tasks_list($new_sched_list, $del_sched_list)
{
	//逐条更新到memcached数组中
	$use_sched_list = [];
	foreach ($new_sched_list as $key=>$value) {
		if (time() < $value['finish_time']) {
			$use_sched_list[$key] = $value;
			mmc_array_set(NS_SCHED_TASKS, $key, $value, $value['finish_time']);
		}
	}

	//这是分发任务用的cache列表，更新之
	used_sched_list($use_sched_list);

	//将需要删除的清除掉，让设备不再能够“读取”从而禁止规则执行
	foreach ($del_sched_list as $key=>$value) {
		mmc_array_del(NS_SCHED_TASKS, $key);
	}
}

function mmc_array_all_cache($name)
{
	$list = mmc_array_all($name);
	$file_name = __DIR__.'/cache/'.$name.'.cache';

	if (count($list) === 0) {
		$list = unserialize(file_get_contents($file_name));
		if (empty($list)) {
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

function used_sched_list($new_list=null)
{
	$mem = api_open_mmc();
	if ($new_list === null) {
		$result = $mem->get(KEY_SCHED_LIST);
		(!$result) && ($result=array());
		return $result;
	} else {
		return $mem->set(KEY_SCHED_LIST, $new_list);
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

function make_new_tasks_list($sched_list, $users_list, $message_list)
{
	$result = array();
	foreach ($sched_list as $name=>$task) {
		$new_target = get_user_selected($users_list, $task['target_device']);
		$new_message = get_user_selected($message_list, $task['sched_msg']);

		foreach ($new_message as &$item) {
			$item['text'] = onebox_cached($item['text']);
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