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
$ref_obj = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($ref_obj? ($ref_obj['scheme'].'://'.$ref_obj['host']) : '*'));
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
    session_set_cookie_params(COOKIE_TIMEOUT);
    session_start();

    if(!isset($_SESSION['DEVICE_ID'])) {
        $_SESSION['DEVICE_ID'] = $device = gen_uuid();

		$browser = get_browser(null, true);
        $browser_save = array(
            'device' => $device,
            'browser' => $browser['browser'],
            'platform' => $browser['platform'],
            'ismobiledevice' => $browser['ismobiledevice']
        );

    } else {
        $device = $_SESSION['DEVICE_ID'];
        $browser_json = mmc_array_get(NS_DEVICE_LIST, $device);
        $browser_save = json_decode($browser_json, true);
    }

	$browser_save['region'] = $_SERVER['REMOTE_ADDR'];
	$browser_save['visiting'] = @$_SERVER['HTTP_REFERER'];

	mmc_array_set(NS_DEVICE_LIST, $device, json_encode($browser_save), CACHE_EXPIRE_SECONDS);
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
		$bind_info = json_decode($bind_info_json, true);
	}

	$changed = false;

	if ($username) {
		$username = to_utf8($username);

		if ($bind_info['username'] != $username) {
			$bind_info['username'] = $username;
			$changed = true;
		}
	}
	if ($nickname) {
		$nickname = to_utf8($nickname);

		if ($bind_info['nickname'] != $nickname) {
			$bind_info['nickname'] = $nickname;
			$changed = true;
		}
	}

	if (!$changed) {
		return 'ok';
	}

	if (mmc_array_set($ns_bind_list, $device, json_encode($bind_info))) {
		$caption =  to_utf8($caption);
		mmc_array_caption($ns_bind_list, $caption);
	}

	return 'ok';
}

function to_utf8($input)
{
	if (!is_utf8($input)) {
		return iconv("gb2312","utf-8//IGNORE",$input);
	}
	return $input;
}

function is_utf8($string) 
{
	// From http://w3.org/International/questions/qa-forms-utf-8.html
	return preg_match('%^(?:
	[\x09\x0A\x0D\x20-\x7E] # ASCII
	| [\xC2-\xDF][\x80-\xBF] # non-overlong 2-byte
	| \xE0[\xA0-\xBF][\x80-\xBF] # excluding overlongs
	| [\xE1-\xEC\xEE\xEF][\x80-\xBF]{2} # straight 3-byte
	| \xED[\x80-\x9F][\x80-\xBF] # excluding surrogates
	| \xF0[\x90-\xBF][\x80-\xBF]{2} # planes 1-3
	| [\xF1-\xF3][\x80-\xBF]{3} # planes 4-15
	| \xF4[\x80-\x8F][\x80-\xBF]{2} # plane 16
	)*$%xs', $string);
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

function get_param($name)
{
    $union = array_merge($_GET, $_POST); 
    if ($key && isset($union[$key])) {
        return $union[$key];
    } else {
        return null;
    }
}

?>
