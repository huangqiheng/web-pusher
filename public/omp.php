<?php
error_reporting(0);

require_once 'functions.php';

$PARAMS = get_param();
$in_cmd = @$PARAMS['cmd']; // hbeat | bind | reset

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
$ref_obj = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($ref_obj? ($ref_obj['scheme'].'://'.$ref_obj['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');

switch($in_cmd) {
    case 'hbeat':
        echo handle_heartbeat_cmd();
        break;
    case 'bind':
        echo handle_bind_device($PARAMS);
        break;
    case 'reset':
        echo handle_reset();
        break;
    case 'debug':
        echo handle_debug();
        break;
    default:
        echo 'unreconized cmd.';
}
exit();

function handle_heartbeat_cmd()
{
	omp_trace('heartbeat start');
	/******************************************
	  组织一个更新的心跳包
	******************************************/

	list($is_new, $device, $device_saved) = get_cookie_saved();
	$result = array('device' => $device);

	$browser_save = array();
	$browser_save['device'] = $device;
	$browser_save['ip_addr'] = $_SERVER['REMOTE_ADDR'];
	$browser_save['new_user'] = $is_new;
	$browser_save['ismobiledevice'] = $device_saved[0];
	$browser_save['browser'] = $device_saved[1];
	$browser_save['platform'] = $device_saved[2];
	$browser_save['device_name'] = $device_saved[3];
	$browser_save['region'] = get_region_city();
	$browser_save['language'] = get_accept_language();
	$browser_save['Visiting'] = @$_SERVER['HTTP_REFERER'];
	$browser_save['UserAgent'] = @$_SERVER['HTTP_USER_AGENT'];
	$browser_save['XRequestWith'] = @$_SERVER['HTTP_X_REQUESTED_WITH'];

	/******************************************
	  检查看看该账户有没有绑定信息
	  客户端凭此判断是否提交bind账户操作
	******************************************/

	$mem = api_open_mmc();

	$browser_save['binded'] = false;
	if ($binded_list = $mem->ns_get(NS_BINDED_LIST, $device)) {
		$browser_save['binded'] = true;
		$result['binded'] = $binded_list;
	}

	//获取保存的账户信息
	if ($bind_account = $mem->ns_get(NS_BINDED_CAPTION, $device)) {
		$browser_save['bind_account'] = json_encode($bind_account);
	}

	omp_trace('get account');
	/******************************************
	  更新心跳，维护在线列表
	******************************************/
	$list_stat = mmc_array_set(NS_DEVICE_LIST, $device, $browser_save, CACHE_EXPIRE_SECONDS);
	if ($list_stat > 0) {
		if ($list_stat === 1) {
			require_once 'sched_list.php';
			update_sched_tasks();
		}
		$browser_save['new_visitor'] = true;
	} else {
		$browser_save['new_visitor'] = false;
	}

	omp_trace('update heartbeat');

	/******************************************
	  获取计划任务消息 
	******************************************/

	if ($items_result = get_sched_messages($browser_save)) {
		$result['sched_msg'] = $items_result;
		$browser_save['sched_msg'] = base64_encode(json_encode($items_result));
	}

	omp_trace('sched messages');
	/*************************************
	  获取异步消息
	*************************************/

	if ($cmdbox_list = $mem->ns_get(NS_HEARTBEAT_MESSAGE, $device)) {
		$cmdbox = array_shift($cmdbox_list);
		$result['async_msg'] = $cmdbox;
		$browser_save['async_msg'] = base64_encode(json_encode($cmdbox));
		if (count($cmdbox_list) == 0) {
			$mem->ns_delete(NS_HEARTBEAT_MESSAGE, $device);
		} else {
			$mem->ns_set(NS_HEARTBEAT_MESSAGE, $device, $cmdbox_list, CACHE_EXPIRE_SECONDS); 
		}
	}

	omp_trace('async messages');
	/*************************************
		输出结果
	*************************************/

	call_notifier($browser_save);
	omp_trace('call notifier');

	if (is_debug_client()) {
		$result['trace'] = omp_trace(null);
	}
	return jsonp($result);
}

function get_accept_language()
{
	$ori = @$_SERVER['HTTP_ACCEPT_LANGUAGE'];
	if (empty($ori)) {
		return '';
	}

	$arr = explode(',', $ori);
	if (count($arr)>0) {
		return $arr[0];
	}

	return '';
}

function get_init_session()
{
	return [
		'last_time'=>0, 
		'start_time'=>time(), 
		'run_times'=>0, 
		'pageviews'=>0
		];
}

function get_sched_messages($browser_save)
{
	//return false;
	/******************************************
	  新设备检查和颁发机会任务消息
	******************************************/
	$device = $browser_save['device'];
	$new_visitor = $browser_save['new_visitor'];

	//计划消息列表
	$mem = api_open_mmc();
	$sched_block = $mem->ns_get(NS_SCHED_DEVICE, $device);
	if (!$sched_block) {
		$sched_block = [
			'items'=>[], 
			'session'=>get_init_session(),
			'global'=>['visit_times'=>0, 'pageviews'=>0]
		];
	}

	$exec_items = &$sched_block['items'];
	$session = &$sched_block['session'];
	$global = &$sched_block['global'];
	
	//初始化session
	if ($browser_save['new_visitor']) {
		$session = get_init_session();
		$global['visit_times'] += 1;
	}

	$session['pageviews'] += 1;
	$global['pageviews'] += 1;

	//逐级检查和颁发新任务
	do {
		//检查是否需要清理任务
		$task_items = $mem->get(KEY_SCHED_LIST);
		$items_del = array_diff_key($exec_items, $task_items);
		if (!empty($items_del)) {
			$names = [];
			foreach($items_del as $key=>$item) {
				unset($exec_items[$key]);
				$names[] = $item['name'];
			}
			omp_trace(implode(',', $names).' tasks del');
		}

		//如果对比任务列表并没有发生变化，就不用颁发了
		$new_tasks = array_diff_key($task_items, $exec_items);
		if (empty($new_tasks)) {
			omp_trace('no new tasks');
			break;
		}

		//逐个分析新出现任务，检查UA相关规则，不符合就不用颁发了
		foreach($new_tasks as $key=>$item) {
			//检查对这个任务的分析结果
			if (!targets_matched($item['targets'], $browser_save)) {
				//不符合条件的，设置一个bypass标志
				$exec_items[$key] = 'bypass';
				omp_trace('pass '.$item['name']);
				continue;
			}

			//现在可以颁发了，
			//所谓颁发，就是生成一个初始化的任务数组
			$task_info = array();
			$task_info['name'] = $item['name']; 
			$task_info['run_times'] = 0; 
			$task_info['last_time'] = 0; 
			remake_msgque($task_info, $item);

			$exec_items[$key] = $task_info;
			omp_trace($item['name'].' new task');
		}
	} while(false);

	/*************************************
		获取计划任务消息
	*************************************/
	//上面新访时检查和颁发任务，那仅仅是筛选，在这里将从新详细分析

	$items_expired = array();
	$items_result = array();
	foreach($exec_items as $task_id =>&$task_info) {
		//如果查不到了，那是超时删除了，这个任务将被取消
		$task = mmc_array_get(NS_SCHED_TASKS, $task_id);
		$task_name = $task_info['name'];
		if (empty($task)) {
			$items_expired[] = $task_id;
			omp_trace($task_name.' expired');
			continue;
		}

		//忽略不是自己的任务
		if ($task_info === 'bypass') {
			omp_trace($task_name.' not mine');
			continue;
		}

		//任务是否被用户停止
		$status = $task['status'];
		if ($status === 'stop') {
			omp_trace($task_name.' stopped ');
			continue;
		}

		$task_print = $task_name.'('.$task_info['run_times'].'/'.$task['times'].')';

		//如果前面已经有了返回信息，这时遇到“互斥”只能忽略掉
		if (($task['repel'] === 'true') && (count($items_result)>0)) {
			omp_trace($task_print.' repel');
			continue;
		}

		//判断任务的时间状态
		$now = time();
		$run_status = ($now<$task['start_time'])? 'waiting' : (($now>$task['finish_time'])? 'timeout' : 'running');

		//纠正任务列表中显示的状态
		if ($run_status !== $status) {
			call_async_php("/data.php?cmd=status&key=$task_id&val=$run_status");
		}

		//检查是否在时间区间内，否则忽略
		if ($run_status !== 'running') {
			omp_trace($task_print.' not time rigion ');
			continue;
		}

		//在时间区间内，但看看前面一个消息距离是否足够
		if (($now-$session['last_time'])<$task['time_interval_pre']) {
			omp_trace($task_print.' pre time not reach ');
			continue;
		}

		//检查执行次数是否已经达到
		if ($task_info['run_times'] >= $task['times']) {
			omp_trace($task_print.' times exceed ('.$task['times'].')');
			continue;
		} 

		//检查发送周期，还没到时间的，则忽略
		if ($task['time_interval_mode']  === 'relative') {
			$time_point = $task_info['last_time'] + $task['time_interval'];
			if ($now < $time_point) {
				omp_trace($task_print.' time relative until '.date(DATE_RFC822,$time_point));
				continue;
			}
		} else {
			$interval = $task['time_interval'];
			$base_time = $task['start_time'];
			$lasttime_pass = $task_info['last_time'] - $base_time;
			$time_point = $base_time + intval($lasttime_pass/$interval+1)*$interval;
			if ($now < $time_point) {
				omp_trace($task_print.' time absolute until '.date(DATE_RFC822,$time_point));
				continue;
			}
		}

		//追加必要参数

		$browser_save['sec_staytime'] = $now-$session['start_time'];
		$browser_save['sec_pageviews'] = $session['pageviews'];
		$browser_save['all_pageviews'] = $global['pageviews'];
		$browser_save['visit_times'] = $global['visit_times'];

		//详细再查条件
		$matched_target = targets_matched($task['targets'], $browser_save, true);
		if (!$matched_target) {
			omp_trace($task_print.' target not match');
			continue;
		}

		//处理用户改变消息模式
		$messages = $task['messages'];
		
		if (($task_info['ori_seq'] !== $task['msg_sequence']) ||//如果用户改变了排序模式
		    ($task_info['ori_msglen'] !== count($messages)) || //如果用户改变了消息数量
		    ($task_info['ori_times'] < $task['times'])) { //如果用户增大了发生次数
			remake_msgque($task_info, $task);
			$messages = $task['messages'];
		}

		//ok, 条件吻合了，可以发送信息了
		$msg_queue = $task_info['msg_queue'];
		$msg_index = $msg_queue[$task_info['run_times']];
		$selected_message = @$messages[$msg_index];

		//居然取不到消息，那也不用发了
		if (empty($selected_message)) {
			omp_trace($task_print.' cant fetch message ');
			continue;
		}

		//保存要显示到客户端的消息
		$items_result[] = $selected_message;

		//统计和日志

		//成功取出了消息，设置状态
		$task_info['run_times'] += 1;
		$task_info['last_time'] = $now;
		$session['last_time'] = $now;
		$session['run_times'] += 1;
		omp_trace($task_print.' succeed '.$selected_message['name']);

		//如果是互斥的信息，后面不用再匹配了
		if ($task['repel'] === 'true') {
			omp_trace($task_print.'break for repel');
			break;
		}
	}

	//删除被撤销的任务
	if (!empty($items_expired)) {
		omp_trace('expired '.implode(',', $items_expired));
		async_timer('/sched_list.php?force', 10);
	}

	//需要保存状态到memcached
	$mem->ns_set(NS_SCHED_DEVICE, $device, $sched_block);

	return (count($items_result))? $items_result : false;
}

function get_device()
{
	return isset($_COOKIE[COOKIE_DEVICE_ID]) ? $_COOKIE[COOKIE_DEVICE_ID] : null;
}

function new_user($expired = null)
{
	if ($expired) {
		setcookie(COOKIE_NEW, 'true', $expired, '/', COOKIE_DOMAIN);
		return true;
	} else {
		return isset($_COOKIE[COOKIE_NEW])? ($_COOKIE[COOKIE_NEW] === 'true') : false;
	}
}

function get_cookie_saved()
{
	$device = get_device();
	$is_new = false;

	if (empty($device)) {
		$device = gen_uuid();
		setcookie(COOKIE_DEVICE_ID, $device, time()+COOKIE_TIMEOUT, '/', COOKIE_DOMAIN);
		$is_new = new_user(time()+COOKIE_TIMEOUT_NEW);
	} else {
		$is_new = new_user();
	}

	$browser = isset($_COOKIE[COOKIE_DEVICE_SAVED]) ? $_COOKIE[COOKIE_DEVICE_SAVED] : null;
	$device_saved = null;

	if ($browser) {
		$device_saved = json_decode(base64_decode($browser), true);
		$error = json_last_error();
		if ($error === JSON_ERROR_NONE) {
			$device_saved[0] = empty($device_saved[0]) ? false : true;
			return array($is_new, $device, $device_saved);
		} else {
			$browser = null;
		}
	}

	$useragent = $_SERVER['HTTP_USER_AGENT'];
	$browser_o = get_browser_mem($useragent);
	$device_name = get_device_mem($useragent);

	$device_saved = array($browser_o->ismobiledevice, $browser_o->browser, $browser_o->platform, $device_name);
	$device_saved_encode = base64_encode(json_encode($device_saved));

	setcookie(COOKIE_DEVICE_SAVED, $device_saved_encode, time()+COOKIE_TIMEOUT, '/', COOKIE_DOMAIN);
	return array($is_new, $device, $device_saved);
}

function call_notifier($browser_save)
{
	//异步调用“访问记录”扩展
	counter(COUNT_ON_HEARTBEAT);
	call_async_php('/on_heartbeat.php', $browser_save);
	//触发定期维护的异步过程
	async_timer('/on_timer_online_list.php', CHECKPOINT_INTERVAL);
}

function get_region_city()
{
	if (VIEW_REGION) {
		return get_locale_mem($_SERVER['REMOTE_ADDR']);
	} else {
		return $_SERVER['REMOTE_ADDR'];
	}
}

function is_admin($browser_save)
{
	return preg_match('/admin/i', @$browser_save['bind_account']);
}
function remake_msgque(&$task_info, &$task)
{
	$make_step = count($task['messages']); 
	$make_count = $task['times'];
	$make_mode = $task['msg_sequence'];
	$task_info['msg_queue']=make_msgque($make_step, $make_count, $make_mode);
	$task_info['ori_seq']   = $make_mode;
	$task_info['ori_times'] = $make_count;
	$task_info['ori_msglen']   = $make_step;
}

function match_normal($target, $browser_save, $keys)
{
	foreach ($keys as $key_name) {
		$from_device = @$browser_save[$key_name];
		$from_config = @$target[$key_name];

		//执行bool类型的命令匹配
		if (is_bool($from_device)) {
			if (!match_bool($from_device, $from_config)) {
				omp_trace("$key_name not match: ".$from_device.'!='. $from_config);
				return false;
			} else {

			}
			//执行子字符串的命令匹配
		} elseif (is_string($from_device)) {
			if (!match_substr($from_device, $from_config)) {
				omp_trace("$key_name not substr: ".$from_device.'!='. $from_config);
				return false;
			} else {

			}
		} elseif (is_null($from_device))  {
			if ($from_config !== '--') {
				return false;
			}
		} else {

		}
	}
	return true;
}

function targets_matched($targets, $browser_save, $is_detail=false)
{
	$matched = false;
	foreach($targets as $target) {
		do {
			$key_names = ['ismobiledevice', 'browser', 'platform', 'device_name', 'region'];
			if (!match_normal($target, $browser_save, $key_names)) {
				omp_trace('browser matched failure');
				break;
			}

			//正则表达式匹配UA，如果不匹配则这条任务略过
			$UA = $browser_save['UserAgent'].$browser_save['XRequestWith'];
			if (!match_regex($UA, $target['UserAgent'])) {
				omp_trace('UserAgent substr: '.$UA.'!='.$target['UserAgent']);
				break;
			}

			//如果是详细匹配，要包括实时的Visiting和Account
			if ($is_detail) {
				$key_names = ['new_user','new_visitor','binded', 'bind_account'];
				if (!match_normal($target, $browser_save, $key_names)) {
					omp_trace('user matched failure');
					break;
				}

				//正访问网址的正则匹配
				if (!match_regex($browser_save['Visiting'],$target['Visiting'])){
					omp_trace('target : '.$browser_save['Visiting'].'!='.$target['Visiting']);
					break;
				}

				//访问停留时间
				if (!match_range($browser_save['sec_staytime'], $target['stay_time'])) {
					omp_trace('target sec_staytime: '.$browser_save['sec_staytime'].'!='.$target['stay_time']);
					break;
				}

				//访问页面次数
				if (!match_range($browser_save['sec_pageviews'], $target['pageview_range'])) {
					omp_trace('target sec_pageviews: '.$browser_save['sec_pageviews'].'!='.$target['pageview_range']);
					break;
				}

				//总访问页面次数
				if (!match_range($browser_save['all_pageviews'], $target['allpageview_range'])) {
					omp_trace('target all_pageviews: '.$browser_save['all_pageviews'].'!='.$target['allpageview_range']);
					break;
				}

				//来访次数
				if (!match_range($browser_save['visit_times'], $target['visit_times_range'])) {
					omp_trace('target visit_times: '.$browser_save['visit_times'].'!='.$target['visit_times_range']);
					break;
				}
			}

			//过关斩将，最后匹配成功了
			$matched = $target;
			omp_trace('match: '.$target['name']);
			break 2;
		} while(false);
	}
	return $matched;
}

function match_range($current_val, $range_str)
{
	$result = true;
	if ($range_str === '--') {
		return $result;
	}

	$ranges = explode(',', $range_str);
	foreach($ranges as $range_item) {
		$range_pair = explode('-', $range_item);
		if (count($range_pair)!==2) {
			continue;
		}
		if (($current_val>=$range_pair[0]) && ($current_val<=$range_pair[1])) {
			return $result;
		}
	}
	return false;
}

function make_msgque($step, $count, $mode)
{
	$source_sequence = ['sequence', 'random', 'confusion'];
	if (!in_array($mode, $source_sequence)) {
		$mode= 'sequence';
	}

	$template  = range(0, $count-1);
	$result = [];
	foreach ($template as  $num) {
		$result[] = $num % $step;
	}

	if ($mode === 'sequence') {
		return $result;
	}  
	elseif ($mode === 'random') {
		$output = [];
		do {
			$sample = range(0, $step-1);
			shuffle($sample);
			$output = array_merge($output, $sample);
		}while(count($output)<$count);
		$output = array_slice($output, 0, $count);
		return $output;
	}  
	elseif ($mode === 'confusion') {
		shuffle($result);
		return $result;
	}
}

function match_regex($from_device, $from_config)
{
	if ($from_config === '--') {
		return true;
	}

	if (preg_match($from_config, $from_device)) {
		return true;
	}
	return false;
}

function match_substr($from_device, $from_config)
{
	if ($from_config === '--') {
		return true;
	}

	if (empty($from_device)) {
		return false;
	}

	$from_device = strtolower($from_device);
	$from_config = strtolower($from_config);

	$sub_found = false;
	$subitems = explode(' ', $from_config);
	foreach($subitems as $subitem) {
		if (false !== strpos($from_device, $subitem)) {
			$sub_found = true;
			break;
		}
	}
	return $sub_found;
}

function match_bool($from_device, $from_config)
{
	if ($from_config === 'null') {return true;}
	if (($from_config === 'true') xor $from_device) {return false;}
	return true;
}

function handle_bind_device($PARAMS)
{
	$device    = @$PARAMS[ 'device' ];
	$platform    = @$PARAMS[ 'plat' ];
	$caption     = @$PARAMS[ 'cap' ];
	$username    = @$PARAMS[ 'user' ];
	$nickname    = @$PARAMS[ 'nick' ];

	/********************************
	判断新收到的账户，是否应该被收录	
	********************************/

	if ((empty($username)) && (empty($nickname))) {
		return jsonp(array('res'=>'no'));
	}

	$platform_list = mmc_array_keys(NS_BINDING_LIST);
	if (!in_array($platform, $platform_list)) {
		mmc_array_set(NS_BINDING_LIST, $platform, $caption);
	}

	$ns_bind_list = NS_BINDING_LIST.$platform;
	$bind_info = mmc_array_get($ns_bind_list, $device);

	$changed = false;

	if ($bind_info) {
		if ($username) {
			if ($bind_info['username'] != $username) {
				$bind_info['username'] = $username;
				$changed = true;
			}
		}

		if ($nickname) {
			if ($bind_info['nickname'] != $nickname) {
				$bind_info['nickname'] = $nickname;
				$changed = true;
			}
		}
	} else {
		$bind_info =  array();
		$bind_info['username'] = $username;
		$bind_info['nickname'] = $nickname;
		$changed = true;
	}

	if (!$changed) {
		return jsonp(array('res'=>'ok'));
	}

	/********************************
		记录绑定的账户
	********************************/

	//1、收录绑定信息
	if (mmc_array_set($ns_bind_list, $device, $bind_info) > 0) {
		($caption) && mmc_array_caption($ns_bind_list, $caption);
	}

	//2、制作绑定账户的标识列表
	$new_key = md5($caption.'@'.$platform.'@'.$device);
	$new_val = md5($username.'('.$nickname.')@'.$device);
	$changed = false;
	$mem = api_open_mmc();
	if ($binded_list = $mem->ns_get(NS_BINDED_LIST, $device)) {
		if ($binded_list[$new_key] !== $new_val) {
			$binded_list[$new_key] = $new_val;
			$changed = true;
		}
	} else {
		$binded_list[$new_key] = $new_val;
		$changed = true;
	}
	//更新绑定账户标记列表
	if ($changed) {
		$mem->ns_set(NS_BINDED_LIST, $device, $binded_list); 
	}

	//3、制作绑定账户显示列表
	empty($nickname) && (!empty($username)) && ($cap_view=$username.'@'.$caption);
	empty($username) && (!empty($nickname)) && ($cap_view=$nickname.'@'.$caption);
	empty($cap_view) && ($cap_view=$nickname.'('.$username.')@'.$caption);

	if ($bind_account = $mem->ns_get(NS_BINDED_CAPTION, $device)) {
		if (!in_array($cap_view, $bind_account)) {
			$bind_account[] = $cap_view;
			$mem->ns_set(NS_BINDED_CAPTION, $device, $bind_account); 
		}
	} else {
		$mem->ns_set(NS_BINDED_CAPTION, $device, array($cap_view)); 
	}

	/********************************
	异步通知第三方代码
	********************************/

	$bind_info['device'] = $device;
	$bind_info['platform'] = $platform;
	$bind_info['caption'] = $caption;
	counter(COUNT_ON_BINDING);
	call_async_php('/on_account_binding.php', $bind_info);

	return jsonp(array('res'=>'ok!'));
}

function handle_clear()
{
	//删除保存了的在线列表
	mmc_array_del(NS_DEVICE_LIST, $device);
}

function handle_reset()
{
	$device = get_device();
	if (empty($device)) {return 'no device';}

	//清除本session
	handle_clear();

	//删除保存了的账户信息
	$mem = api_open_mmc();
	$mem->ns_delete(NS_BINDED_LIST, $device); 
	$mem->ns_delete(NS_BINDED_CAPTION, $device);
	foreach (mmc_array_keys(NS_BINDING_LIST) as $platform) {
		$ns_bind_list = NS_BINDING_LIST.$platform;
		mmc_array_del($ns_bind_list, $device);
	}

	//删除保存了的计划任务消息记录
	$mem->ns_delete(NS_SCHED_DEVICE, $device);
	new_user(time()+COOKIE_TIMEOUT_NEW);

	return 'succeed';
}

function is_debug_client()
{
	return isset($_COOKIE[COOKIE_DEBUG]) ? $_COOKIE[COOKIE_DEBUG] === 'true' : false;
}

function handle_debug()
{
	if (is_debug_client()) {
		setcookie(COOKIE_DEBUG, '', time()-3600, '/', COOKIE_DOMAIN);
		return 'off';
	} else {
		setcookie(COOKIE_DEBUG, 'true', time()+COOKIE_TIMEOUT, '/', COOKIE_DOMAIN);
		return 'on';
	}
}

function omp_trace($descript=null)
{
	if (!CLIENT_DEBUG) {return;}
	if (!is_debug_client()) {return;}
	if (is_array($descript)) {
		$descript = (json_encode($descript));
	}
	return time_print($descript);
}


function iscmd($cmd)
{
	$in_cmd = isset($_GET['cmd'])? $_GET['cmd'] : null;
	if (empty($in_cmd)) return null;
	return ($in_cmd == $cmd);
}

function get_param($key = null)
{
    $union = array_merge($_GET, $_POST); 
    if ($key) {
        return @$union[$key];
    } else {
        return $union;
    }
}


?>
