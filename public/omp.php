<?php

define('PUSHER_DOMAIN', 'omp.cn');
define('PUSHER_HOST', 'localhost');
define('PUSHER_PORT', 3128);
define('MEMC_HOST', '127.0.0.1');
define('MEMC_PORT', 11211);
define('CACHE_EXPIRE_SECONDS', 1800);

$in_type 	= get_param('type');
$in_cmd  	= get_param('cmd');
$in_message  	= get_param('msg');
$in_device_id	= get_param('device');
$in_platform	= get_param('plat');
$in_username	= get_param('user');
$in_nickname	= get_param('nick');

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
$referer = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($referer ? ($referer['scheme'].'://'.$referer['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');

empty($in_type) && exit();
isset($in_cmd) && goto label_device;
empty($in_device_id) && exit();
isset($in_message) && goto label_sendmessage;
isset($in_platform) && isset($in_username) && isset($in_nickname) && goto label_sendmessage;
exit();

label_device:

exit();

label_sendmessage:

exit();

function get_param($name)
{
	return (isset($_GET[$name]))? $_GET[$name] : null;
}

function send_message($device_id, $message)
{
	$pub_url = 'http://'.PUSHER_HOST.':'.PUSHER_PORT.'/pub?id='.$device_id;
        $headers = ['Content-Type: application/json; charset=utf-8'];
	$headers[] = 'Host: '.PUSHER_DOMAIN;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $pub_url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $message);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);

        $res = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_errno($ch);
        curl_close($ch);

	return ($err)? (($httpcode==200)? $res : null) : null;
}

function cache($key, $value=null)
{
	$mem = new Memcache;
	$mem->connect(MEMC_HOST, MEMC_PORT);
	if (isnull($value)) {
		$result = $mem->get($key);
		$mem->close();
		return $result;
	} else {
		$mem->set($key, $value, 0, CACHE_EXPIRE_SECONDS);
		$mem->close();
		return null;
	}
}
?>
