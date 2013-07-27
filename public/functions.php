<?php
require_once 'functions/memcached_namespace.php';
require_once 'functions/memcache_array.php';
require_once 'functions/async_call.php';
require_once 'functions/geoipcity.php';
require_once 'functions/device_name.php';
require_once 'config.php';

function print_r2($val){
	echo '<pre>';
	print_r($val);
	echo  '</pre>';
}

function sched_changed()
{
	$mem = api_open_mmc();
	$mem->set(SCHEDUAL_UPDATE_KEY, time());
}

function sched_changed_time()
{
	$mem = api_open_mmc();
	return $mem->get(SCHEDUAL_UPDATE_KEY);
}

function get_browser_mem($useragent)
{
	$mem = api_open_mmc();
	$digest = md5($useragent);
	if ($browser_o = $mem->ns_get(GET_BROWSER, $digest)) {
		return $browser_o;
	}

	$browser_o = get_browser($useragent);
	$mem->ns_set(GET_BROWSER, $digest, $browser_o, GET_BROWSER_EXPIRE);
	return $browser_o;
}

function get_device_mem($useragent)
{
	$digest = md5($useragent);
	$mem = api_open_mmc();
	if ($device_name = $mem->ns_get(GET_DEVICE, $digest)) {
		return $device_name;
	}

	$device_name  = get_device_name($useragent);
	$mem->ns_set(GET_DEVICE, $digest, $device_name, GET_DEVICE_EXPIRE);
	return $device_name;
}

function get_locale_mem($ip)
{
	$mem = api_open_mmc();
	if ($city_name = $mem->ns_get(GET_DEVICE, $ip)) {
		return $city_name;
	}

	$city_name = get_city_name($ip);
	if (empty($city_name)) {
		$city_name = $ip;
	}

	$mem->ns_set(GET_LOCALE, $ip, $city_name, GET_LOCALE_EXPIRE);
	return $city_name;
}

define('COUNT_NS', 'COUNT_NS');
define('COUNT_ON_HEARTBEAT', 1);
define('COUNT_IN_HEARTBEAT', 2);
define('COUNT_ON_ACTIVE', 3);
define('COUNT_IN_ACTIVE', 4);
define('COUNT_BINDING', 5);
define('COUNT_ON_BINDING', 6);
define('COUNT_IN_BINDING', 7);

function counter($count_type = 0, $recursive = false)
{
	$mem = api_open_mmc();

	switch($count_type) {
		case COUNT_ON_HEARTBEAT:
			$result = $mem->ns_increment(COUNT_NS, 'COUNT_ON_HEARTBEAT');
			break;
		case COUNT_IN_HEARTBEAT:
			$result = $mem->ns_increment(COUNT_NS, 'COUNT_IN_HEARTBEAT');
			break;
		case COUNT_ON_ACTIVE:
			$result = $mem->ns_increment(COUNT_NS, 'COUNT_ON_ACTIVE');
			break;
		case COUNT_IN_ACTIVE:
			$result = $mem->ns_increment(COUNT_NS, 'COUNT_IN_ACTIVE');
			break;
		case COUNT_BINDING:
			$result = $mem->ns_increment(COUNT_NS, 'COUNT_BINDING');
			break;
		case COUNT_ON_BINDING:
			$result = $mem->ns_increment(COUNT_NS, 'COUNT_ON_BINDING');
			break;
		case COUNT_IN_BINDING:
			$result = $mem->ns_increment(COUNT_NS, 'COUNT_IN_BINDING');
			break;
		default:
			$on_heartbeat = $mem->ns_get(COUNT_NS, 'COUNT_ON_HEARTBEAT');
			$in_heartbeat = $mem->ns_get(COUNT_NS, 'COUNT_IN_HEARTBEAT');
			$on_active = $mem->ns_get(COUNT_NS, 'COUNT_ON_ACTIVE');
			$in_active = $mem->ns_get(COUNT_NS, 'COUNT_IN_ACTIVE');
			$binding = $mem->ns_get(COUNT_NS, 'COUNT_BINDING');
			$on_binding = $mem->ns_get(COUNT_NS, 'COUNT_ON_BINDING');
			$in_binding = $mem->ns_get(COUNT_NS, 'COUNT_IN_BINDING');
			$result = "心跳({$on_heartbeat}>{$in_heartbeat}) 活跃({$on_active}>{$in_active}) 绑定({$binding}>{$on_binding}>{$in_binding})";
	}

	if ((!$result) && (!$recursive)) {
		$mem->ns_set(COUNT_NS, 'COUNT_ON_HEARTBEAT', 0);
		$mem->ns_set(COUNT_NS, 'COUNT_IN_HEARTBEAT', 0);
		$mem->ns_set(COUNT_NS, 'COUNT_ON_ACTIVE', 0);
		$mem->ns_set(COUNT_NS, 'COUNT_IN_ACTIVE', 0);
		$mem->ns_set(COUNT_NS, 'COUNT_BINDING', 0);
		$mem->ns_set(COUNT_NS, 'COUNT_ON_BINDING', 0);
		$mem->ns_set(COUNT_NS, 'COUNT_IN_BINDING', 0);
		return counter($count_type, true);
	}

	return $result;
}

function is_valid_jsonp_callback($subject)
{
	$identifier_syntax = '/^[$_\p{L}][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}]*+$/u';
	$reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
			'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue', 
			'for', 'switch', 'while', 'debugger', 'function', 'this', 'with', 
			'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum', 
			'extends', 'super', 'const', 'export', 'import', 'implements', 'let', 
			'private', 'public', 'yield', 'interface', 'package', 'protected', 
			'static', 'null', 'true', 'false');
	return preg_match($identifier_syntax, $subject)
		&& ! in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words);
}

function jsonp($data)
{
	header('content-type: application/json; charset=utf-8');
	$json = json_encode($data);

	if(!isset($_GET['callback']))
	    return $json;

	if(is_valid_jsonp_callback($_GET['callback']))
	    return "{$_GET['callback']}($json)";

	return false;
}


function loglocal($object)
{
	file_put_contents('debug.log', print_r($object,true)."\n", FILE_APPEND);
}

function api_open_mmc()
{
	$mem = new NSMemcached(API_MEMC_POOL);
	$ss = $mem->getServerList();
	if (empty($ss)) {
		$mem->addServer(MEMC_HOST, MEMC_PORT);
	}
	return $mem;
}

define('SCRIPT_TIMER', 'SCRIPT_TIMER');

function async_timer($script_path, $time_interval=null)
{
	$mem = api_open_mmc();
	$item = $mem->ns_get(SCRIPT_TIMER, $script_path);
	$now_time = time();

	do {
		if (empty($item)) {break;}

		if (is_null($time_interval)) {
			$time_interval = $item['interval'];
		}

		if ($now_time - $item['lasttime'] > $time_interval) {break;}
		return $item['lasttime'];
	} while(false);
	
	if (is_null($time_interval)) {
		return $now_time;
	}

	$new_item = array('interval'=>$time_interval, 'lasttime'=>$now_time);
	$mem->ns_set(SCRIPT_TIMER, $script_path, $new_item);
	call_async_php($script_path);
	return $now_time;
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

	return ($err==0)? (($httpcode==200)? $res : null) : null;
}

function gen_uuid() {
    return sprintf( '%04x%04x%04x%04x%04x%04x%04x%04x',
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
        mt_rand( 0, 0xffff ),
        mt_rand( 0, 0x0fff ) | 0x4000,
        mt_rand( 0, 0x3fff ) | 0x8000,
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
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

function to_utf8($input)
{
	if (!is_utf8($input)) {
		return iconv("gb2312","utf-8//IGNORE",$input);
	}
	return $input;
}

function getDateStyle($sorce_date)
{
	$nowTime = time();  //获取今天时间戳  
	$timeHtml = ''; //返回文字格式  
	$temp_time = 0;  
	switch($sorce_date){  
		case ($sorce_date+60) >= $nowTime:  
			$temp_time = $nowTime-$sorce_date;  
			$timeHtml = $temp_time ."秒前";  
			break;  
		case ($sorce_date+3600) >= $nowTime:  
			$temp_time = date('i',$nowTime-$sorce_date);  
			$timeHtml = $temp_time ."分钟前";  
			break;  
		case ($sorce_date+3600*24) >= $nowTime:  
			$temp_time = date('H',$nowTime)-date('H',$sorce_date);  
			if ($temp_time < 0) {
				$temp_time = 24 + $temp_time;
			}
			$timeHtml = $temp_time .'小时前';  
			break;  
		case ($sorce_date+3600*24*2) >= $nowTime:  
			$temp_time = date('H:i',$sorce_date);  
			$timeHtml = '昨天'.$temp_time ;  
			break;  
		case ($sorce_date+3600*24*3) >= $nowTime:  
			$temp_time  = date('H:i',$sorce_date);  
			$timeHtml = '前天'.$temp_time ;  
			break;  
		case ($sorce_date+3600*24*4) >= $nowTime:  
			$timeHtml = '3天前';  
			break;  
		default:  
			$timeHtml = date('Y-m-d',$sorce_date);  
			break;  
	}  
	return $timeHtml;  
} 

function bytesToSize($bytes, $precision = 2)
{  
	$kilobyte = 1024;
	$megabyte = $kilobyte * 1024;
	$gigabyte = $megabyte * 1024;
	$terabyte = $gigabyte * 1024;

	if (($bytes >= 0) && ($bytes < $kilobyte)) {
		return $bytes . ' B';

	} elseif (($bytes >= $kilobyte) && ($bytes < $megabyte)) {
		return round($bytes / $kilobyte, $precision) . ' KB';

	} elseif (($bytes >= $megabyte) && ($bytes < $gigabyte)) {
		return round($bytes / $megabyte, $precision) . ' MB';

	} elseif (($bytes >= $gigabyte) && ($bytes < $terabyte)) {
		return round($bytes / $gigabyte, $precision) . ' GB';

	} elseif ($bytes >= $terabyte) {
		return round($bytes / $terabyte, $precision) . ' TB';
	} else {
		return $bytes . ' B';
	}
}

$time_record = Array();
$last_time = microtime(true);
$first_time = $last_time;

function time_print($descript=null)
{
	global $time_record;
	global $last_time, $first_time;
	$now_time = microtime(true);

	if ($descript) {
		array_push($time_record, $descript.' '.intval(($now_time-$last_time)*1000).'ms');
		$last_time = $now_time;
	} else {
		return implode('; ', $time_record).' (total:'.intval(($now_time-$first_time)*1000).'ms)';
	}
}

?>
