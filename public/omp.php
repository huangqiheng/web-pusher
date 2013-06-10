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

function get_device_id()
{
	$device = isset($_COOKIE[COOKIE_DEVICE_ID]) ? $_COOKIE[COOKIE_DEVICE_ID] : null;
	$is_new = false;

	if (empty($device)) {
		$device = gen_uuid();
		setcookie(COOKIE_DEVICE_ID, $device, time()+COOKIE_TIMEOUT, '/', COOKIE_DOMAIN);
		$is_new = true;
	}
	return array($is_new, $device);
}

function handle_heartbeat_cmd()
{
	list($is_new, $device) = get_device_id();
	$browser_save = array();
	$browser_save['device'] = $device;
	$browser_save['new_visitor'] = $is_new;
	$browser_save['useragent'] = $_SERVER['HTTP_USER_AGENT'];
	$browser_save['region'] = $_SERVER['REMOTE_ADDR'];
	$browser_save['visiting'] = $_SERVER['HTTP_REFERER'];

	//更新心跳
	if (mmc_array_set(NS_DEVICE_LIST, $device, $browser_save, CACHE_EXPIRE_SECONDS)) {
		//异步执行重量级的处理过程
		call_async_php('/on_device_active.php', $browser_save);
	}

	//触发定期维护的异步过程
	async_checkpoint('/on_cleanup_list.php');

	$result = array('device' => $device);

	//检查看看有没有异步消息，顺便返回客户端
	$mem = api_open_mmc();
	if ($cmdbox_list = $mem->ns_get(NS_HEARTBEAT_MESSAGE, $device)) {
		$cmdbox = array_shift($cmdbox_list);
		$result['cmdbox'] = $cmdbox;
		if (count($cmdbox_list) == 0) {
			$mem->ns_delete(NS_HEARTBEAT_MESSAGE, $device);
		} else {
			$mem->ns_set(NS_HEARTBEAT_MESSAGE, $device, $cmdbox_list, CACHE_EXPIRE_SECONDS); 
		}
	}

	//检查看看该账户有没有绑定信息，通知客户端有变则再次提交
	if ($binded_list = $mem->ns_get(NS_BINDED_LIST, $device)) {
		$result['binded'] = $binded_list;
	}

	return jsonp($result);
}

function handle_bind_device($PARAMS)
{
	$device    = @$PARAMS[ 'device' ];
	$platform    = @$PARAMS[ 'plat' ];
	$caption     = @$PARAMS[ 'cap' ];
	$username    = @$PARAMS[ 'user' ];
	$nickname    = @$PARAMS[ 'nick' ];

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

	if (mmc_array_set($ns_bind_list, $device, $bind_info) == 1) {
		($caption) && mmc_array_caption($ns_bind_list, $caption);
	}

	$bind_info['device'] = $device;
	$bind_info['platform'] = $platform;
	$bind_info['caption'] = $caption;
	call_async_php('/on_account_binding.php', $bind_info);

	return jsonp(array('res'=>'ok!'));
}

function async_checkpoint($script_path)
{
	$last_time = async_checkpoint_time();
	
	if ((time() - $last_time) > CHECKPOINT_INTERVAL) {
		call_async_php($script_path);
		async_checkpoint_update();
	}
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
