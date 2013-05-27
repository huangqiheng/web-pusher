<?php
require_once 'memcache_array.php';
require_once 'config.php';
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

function handle_heartbeat_cmd()
{
	$device = isset($_COOKIE[COOKIE_DEVICE_ID]) ? $_COOKIE[COOKIE_DEVICE_ID] : null;
	if (empty($device)) {
		$device = gen_uuid();
		setcookie(COOKIE_DEVICE_ID, $device, time()+COOKIE_TIMEOUT, '/', PUSHER_DOMAIN);
	}

	$browser_json = mmc_array_get(NS_DEVICE_LIST, $device);
	if (empty($browser_json)) {
		$browser = get_browser(null, true);
		$browser_save = Array();
		$browser_save['device'] = $device;
		$browser_save['browser'] = $browser['browser'];
		$browser_save['platform'] = $browser['platform'];
		$browser_save['ismobiledevice'] = $browser['ismobiledevice'];
	} else {
		$browser_save = json_decode($browser_json, true);
	}

	$browser_save['region'] = $_SERVER['REMOTE_ADDR'];
	$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
	$browser_save['visiting'] = $http_referer;

	mmc_array_set(NS_DEVICE_LIST, $device, json_encode($browser_save), CACHE_EXPIRE_SECONDS);

	async_checkpoint('/cleanup_routine.php');
	return json_encode(array('device' => $device));
}

function handle_bind_device($PARAMS)
{
	$device    = @$PARAMS[ 'device' ];
	$platform    = @$PARAMS[ 'plat' ];
	$caption     = @$PARAMS[ 'cap' ];
	$username    = @$PARAMS[ 'user' ];
	$nickname    = @$PARAMS[ 'nick' ];

	$ns_bind_list = NS_BINDING_LIST.$platform;

	$platform_list = mmc_array_keys(NS_BINDING_LIST);
	if (!in_array($platform, $platform_list)) {
		mmc_array_set(NS_BINDING_LIST, $platform, $caption);
	}

	$bind_info_json = mmc_array_get($ns_bind_list, $device);
	$bind_info = empty($bind_info_json) ? array() : json_decode($bind_info_json, true); 

	$changed = false;

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

	if (!$changed) {
		return 'ok';
	}

	if (mmc_array_set($ns_bind_list, $device, json_encode($bind_info))) {
		($caption) && mmc_array_caption($ns_bind_list, $caption);
	}

	return 'ok!';
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
