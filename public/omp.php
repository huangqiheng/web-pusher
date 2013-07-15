<?php
require_once 'functions.php';

$PARAMS = get_param();
$in_cmd      = @$PARAMS[ 'cmd' ]; // hbeat | bind | reset

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
    default:
        echo 'unreconized cmd.';
}
exit();

function get_cookie_saved()
{
	$device = isset($_COOKIE[COOKIE_DEVICE_ID]) ? $_COOKIE[COOKIE_DEVICE_ID] : null;
	$is_new = false;

	if (empty($device)) {
		$device = gen_uuid();
		setcookie(COOKIE_DEVICE_ID, $device, time()+COOKIE_TIMEOUT, '/', COOKIE_DOMAIN);
		$is_new = true;
	}

	$browser = isset($_COOKIE[COOKIE_DEVICE_SAVED]) ? $_COOKIE[COOKIE_DEVICE_SAVED] : null;
	$device_saved = null;

	if ($browser) {
		$device_saved = json_decode(base64_decode($browser), true);
		$error = json_last_error();
		if ($error === JSON_ERROR_NONE) {
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
	async_timer('/on_cleanup_list.php', CHECKPOINT_INTERVAL);
	async_timer('/on_sched_handler.php', SCHEDUAL_INTERVAL);
}

function get_region_city()
{
	if (VIEW_REGION) {
		return get_locale_mem($_SERVER['REMOTE_ADDR']);
	} else {
		return $_SERVER['REMOTE_ADDR'];
	}

}

function handle_heartbeat_cmd()
{
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
	$browser_save['visiting'] = @$_SERVER['HTTP_REFERER'];
	$browser_save['useragent'] = $_SERVER['HTTP_USER_AGENT'];

	/******************************************
	  检查看看该账户有没有绑定信息
	  客户端凭此判断是否提交bind账户操作
	******************************************/

	$mem = api_open_mmc();
	if ($binded_list = $mem->ns_get(NS_BINDED_LIST, $device)) {
		$result['binded'] = $binded_list;
	}

	/******************************************
	  新设备检查和颁发机会任务消息
	******************************************/

	//计划消息列表
	$exec_items = $mem->ns_get(NS_HEARTBEAT_SCHEDULE_ITEM, $device);
	if (!$exec_items) {
		$exec_items = array();
	}

	$browser_save['new_visitor'] = false;
	if (mmc_array_set(NS_DEVICE_LIST, $device, $browser_save, CACHE_EXPIRE_SECONDS)) {
		$browser_save['new_visitor'] = true;
		if (mmc_array_length(NS_HEARTBEAT_SCHEDULE) > 0) {
			//逐个检查计划任务命令列表
			$task_items = mmc_array_all(NS_HEARTBEAT_SCHEDULE); 
			foreach($task_items as $key=>$item) {
				//如果已经颁发了，就不需要再次检查
				if (array_key_exists($key, $exec_items)) {continue;}
				$is_match = true;
				//直接匹配所有key相同的
				$same_keys = array_intersect_key($item, $browser_save);
				foreach($same_keys as $key2=>$item2) {
					$sub_found = false;
					//匹配命令字符串
					if (is_string($item2)) {
						//命令中，每个关键字用空格分开
						$subitems = explode(' ', $item2);
						$to_compare = strtolower($browser_save[$key2]);
						foreach($subitems as $subitem) {
							if (strpos($to_compare, $subitem)) {
								$sub_found = true;
								break;
							}
						}
					//例如new_user和ismobiledevice就是bool
					} elseif (is_bool($item2)) {
						if ($item2 == $browser_save[$key2]) {
							$sub_found = true;
							break;
						}
					} else {
					}
					//只要某一个命令匹配不成功，就不需要在继续匹配
					if (!$sub_found) {
						$is_match = false;
						break;
					}
				}
				if (!$is_match) {continue;}

				//正则匹配浏览器特征
				if (array_key_exists('UserAgent', $item)) {
					if (!preg_match($item['UserAgent'], $browser_save['useragent'])) {
						$is_match = false;
						break;
					}
				}
				if (!$is_match) {continue;}

				//添加进执行列表中
				$exec_items[$key] = $item;
				$mem->ns_set(NS_HEARTBEAT_SCHEDULE_ITEM, $device, $exec_items);
			}
		}
	}

	/*************************************
		获取计划任务消息
	*************************************/

	if (count($exec_items) > 0) {
		$items_new  = array();
		$items_result = array();
		$items_changed = false;
		$bypass_all = false;
		foreach($exec_items as $key=>$item) {
			//如果设置了“忽略”标记，则忽略后面所有item
			if ($bypass_all) {
				$items_new[$key] = $item;
				continue;
			}

			//检查是否在时间区间内，否则忽略
			if (time() < $item['start_time']) {
				$items_new[$key] = $item;
				continue;
			}

			//检查是否已经过时，如果过时则需要删除
			if (time() > $item['finish_time']) {
				$items_changed = true;
				continue;
			}

			//检查发送次数，如果为0则需要删除
			if ($item['times'] == 0) {
				$items_changed = true;
				continue;
			}

			//检查发送周期，还没到时间的，则忽略
			if ((time() - $item['time_last']) < $item['time_interval']) {
				$items_new[$key] = $item;
				continue;
			}

			//检查是否是“互斥”的消息，如果是，则忽略
			if ((count($items_result) > 0) && $item['repel']) {
				$items_new[$key] = $item;
				continue;
			}

			//检查Visiting正则匹配
			if (array_key_exists('Visiting', $item)) {
				if (!preg_match($item['Visiting'], $browser_save['visiting'])) {
					$items_new[$key] = $item;
					continue;
				}
			}
		
			//检查该命令，是否必须要登录了才能接收
			if (array_key_exists('binded', $item)) {
				if (array_key_exists('binded', $result) xor $item['binded']) {
					$items_new[$key] = $item;
					continue;
				}
			}

			//检查是否有特定的用户名才能接收
			if (array_key_exists('bind_account', $item)) {
				$is_match = false;
				if ($cap_views = $mem->ns_get(NS_BINDED_CAPTION, $device)) {
					$to_match = implode(',', $cap_views);
					$subitems = explode(' ', $item['bind_account']);
					foreach($subitems as $subitem) {
						if (strpos($to_match, $subitem)) {
							$is_match = true;
							break;
						}
					}
				}
				if (!$is_match) {continue;};
			}

			//接下来，就是符合条件的了，开始执行
			$item['times'] -= 1;
			$item['time_last'] = time();
			$items_changed = true;
			$items_new[$key] = $item;

			//如果这个输出结果是“互斥”的，则可以忽略后面的所有item
			if ($item['repel']) {
				$bypass_all = true;
			}

			//输出结果
			$items_result[] = $item['sched_msg'];
		}

		//任务列表有变，需要保存
		if ($items_changed) {
			$mem->ns_set(NS_HEARTBEAT_SCHEDULE_ITEM, $device, $items_new);
		}

		//输出“计划任务消息”到客户端
		if (count($items_result) > 0) {
			$result['sched_msg'] = $items_result;
			$browser_save['sched_msg'] = base64_encode(json_encode($items_result));
		}
	}

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

	/*************************************
		输出结果
	*************************************/

	call_notifier($browser_save);
	return jsonp($result);
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
	if (mmc_array_set($ns_bind_list, $device, $bind_info) == 1) {
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
	$cap_view = ($nickname ? $nickname : $username).'@'.$caption;
	if ($cap_views = $mem->ns_get(NS_BINDED_CAPTION, $device)) {
		if (!in_array($cap_view, $cap_views)) {
			$cap_views[] = $cap_view;
			$mem->ns_set(NS_BINDED_CAPTION, $device, $cap_views); 
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

function handle_reset($device)
{

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
