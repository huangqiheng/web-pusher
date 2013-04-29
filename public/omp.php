<?php

require_once 'memcache_array.php';
require_once 'config.php';
require_once 'functions.php';

$in_type 	= get_param('type');
$in_cmd  	= get_param('cmd');
$in_message  	= get_param('msg');
$in_device_id	= get_param('device');
$in_platform	= get_param('plat');
$in_caption 	= get_param('cap');
$in_username	= get_param('user');
$in_nickname	= get_param('nick');

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
$referer = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($referer ? ($referer['scheme'].'://'.$referer['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');


empty($in_type) && exit();
if (iscmd('device') && isset($in_cmd)) goto label_device;
empty($in_device_id) && exit();
if (iscmd('send')   && isset($in_message)) goto label_sendmessage;
if (iscmd('bind')   && isset($in_platform) && isset($in_caption) && isset($in_username) && isset($in_nickname)) goto label_bind;
if (iscmd('reset')) goto label_reset;
exit();

label_device:
echo handle_device_cmd($in_cmd);
exit();

label_sendmessage:
echo handle_sendmesage($in_device_id, $in_message);
exit();

label_bind:
echo handle_bind_device($in_device_id, $in_platform, $in_caption, $in_username, $in_nickname);
exit();

label_reset:
echo handle_reset($in_device_id);
exit();

function handle_device_cmd($command)
{
	if ($command == 'get') {
		$device = isset($_COOKIE[COOKIE_DEVICE_ID]) ? $_COOKIE[COOKIE_DEVICE_ID] : null;
		if (empty($device)) {
			setcookie(COOKIE_DEVICE_ID, $device, time()+COOKIE_TIMEOUT, '/', PUSHER_DOMAIN);
		}

		$ua = $_SERVER['HTTP_USER_AGENT'];
		mmc_array_set(NS_DEVICE_LIST, $device, $ua, CACHE_EXPIRE_SECONDS);
		return $device;
	} else 
	if ($command == 'list') {
		return json_encode(mmc_array_all(NS_DEVICE_LIST));
	}
}

function handle_sendmesage($device, $message)
{
	return send_message($device, $message);
}

function handle_bind_device($device, $platform, $caption, $username, $nickname)
{
	$ns_bind_list = NS_BINDING_LIST.$platform;

	$platform_list = mmc_array_all(NS_BINDING_LIST);
	if (!in_array($platform, $platform_list)) {
		mmc_array_set(NS_BINDING_LIST, $platform, $caption);
	}

	$bind_info_json = mmc_array_get($ns_bind_list, $device);

	$bind_info = array();
	if (isset($bind_info_json)) {
		$bind_info = json_decoce($bind_info_json);
	}

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
		mmc_array_caption($ns_bind_list, $caption);
	}

	return 'ok';
}

function handle_reset($device)
{

}

function iscmd($cmd)
{
	global $in_type;
	return ($in_type == $cmd);
}

function get_param($name)
{
	return (isset($_GET[$name]))? $_GET[$name] : null;
}

?>
