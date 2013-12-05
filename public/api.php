<?php
require_once 'functions.php';
require_once 'functions/onebox.php';

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
$referer = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($referer ? ($referer['scheme'].'://'.$referer['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: text/html; charset=utf-8');

$cmd = @$_POST['cmd'];

if ($cmd == 'sendmessage') { 
	$device_list = $_POST['target'];
	$cmdbox = $_POST['cmdbox'];
	$msgmod = $cmdbox['msgmod'];

	$new_text = make_onebox_appgame($cmdbox['text']);
	if ($new_text !== $cmdbox['text']) {
		$cmdbox['text'] = $new_text;
	}

	$ok_res = [];
	$error_res = [];

	//放置异步消息
	if ($msgmod == 'heartbeat') {
		$mem = api_open_mmc();
		foreach($device_list as $device) {
			if ($cmdbox_list = $mem->ns_get(NS_HEARTBEAT_MESSAGE, $device)) {
				array_push($cmdbox_list, $cmdbox);
			} else {
				$cmdbox_list = array($cmdbox);
			}

			if ($mem->ns_set(NS_HEARTBEAT_MESSAGE, $device, $cmdbox_list, CACHE_EXPIRE_SECONDS)) {
				$ok_res[] = $device;
			} else {
				$error_res[] = $device;
			}
		}
		die(jsonp(['ok'=>$ok_res, 'error'=>$error_res]));
	}

	//发送实时消息
	if ($msgmod == 'realtime') {
		$cmdbox_send = rawurlencode(json_encode($cmdbox));
		foreach($device_list as $device) {
			if (send_message($device, $cmdbox_send)) {
				$ok_res[] = $device;
			} else {
				$error_res[] = $device;
			}
		}
		die(jsonp(['ok'=>$ok_res, 'error'=>$error_res]));
	}
} elseif ($cmd == 'sched_message') {

/*
$item['new_user']
$item['new_visitor']
$item['ismobiledevice']
$item['browser']
$item['platform']
$item['device_name']
$item['region']
$item['UserAgent']

$item['finish_time']
$item['start_time']
$item['times']
$item['time_last']
$item['time_interval']
$item['repel']
$item['Visiting']
$item['binded']
$item['bind_account']
$item['sched_msg']
*/

} else {
	$dbg_base64 = @$_GET['debug'];
	if ($dbg_base64) {
		$cmdbox = [];
		$cmdbox['name'] = 'debug message';
		$cmdbox['title'] = 'debug message';
		$cmdbox['text'] = rawurldecode($dbg_base64);
		$cmdbox['sticky'] = 'false';
		$cmdbox['before_open'] = 'false';
		$cmdbox['msgmod'] = 'realtime';
		$cmdbox['msgform'] = 'popup';
		$cmdbox['time'] = 30000;
		$cmdbox['position'] = 'top-left';

		$device_list = ['6a4ba641a4d241a888f84becf05703a2'];

		$ok_res = [];
		$error_res = [];

		$cmdbox_send = rawurlencode(json_encode($cmdbox));
		foreach($device_list as $device) {
			if (send_message($device, $cmdbox_send)) {
				$ok_res[] = $device;
			} else {
				$error_res[] = $device;
			}
		}
		die(jsonp(['ok'=>$ok_res, 'error'=>$error_res]));
	} else {
		echo print_r($_POST, true);
		echo print_r($_GET, true);
	}
}

?>
