<?php
require_once 'memcache_array.php';
require_once 'config.php';
require_once 'functions.php';

$in_cmd  	= get_param('cmd'); // hbeat | bind | reset
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

if (iscmd('hbeat')) goto label_heartbeat;
empty($in_device_id) && exit();
if (iscmd('bind')   && isset($in_platform) && isset($in_caption) && isset($in_username) && isset($in_nickname)) goto label_bind;
if (iscmd('reset')) goto label_reset;
exit();

label_heartbeat:
echo handle_heartbeat_cmd();
exit();

label_bind:
echo handle_bind_device($in_device_id, $in_platform, $in_caption, $in_username, $in_nickname);
exit();

label_reset:
echo handle_reset($in_device_id);
exit();

function handle_heartbeat_cmd()
{
	$device = isset($_COOKIE[COOKIE_DEVICE_ID]) ? $_COOKIE[COOKIE_DEVICE_ID] : null;
	if (empty($device)) {
		setcookie(COOKIE_DEVICE_ID, $device, time()+COOKIE_TIMEOUT, '/', PUSHER_DOMAIN);
	}

	$ua = $_SERVER['HTTP_USER_AGENT'];
	mmc_array_set(NS_DEVICE_LIST, $device, $ua, CACHE_EXPIRE_SECONDS);
	return $device;
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
	if (!empty($bind_info_json)) {
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
	$in_cmd = $_GET['cmd'];
	if (empty($in_cmd)) return null;
	return ($in_cmd == $cmd);
}

function get_param($name)
{
	return (isset($_GET[$name]))? $_GET[$name] : null;
}

?>
