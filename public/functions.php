<?php
require_once 'memcache_array.php';
require_once 'config.php';
require_once 'async_call.php';

function async_checkpoint_time()
{
	$mem = new Memcached(CHECKPOINT_POOL);
	$ss = $mem->getServerList();
	if (empty($ss)) {
		$mem->addServer(MEMC_HOST, MEMC_PORT);
	}

	$last_time = $mem->get(CHECKPOINT_TIME_KEY);
	if (empty($last_time)) {
		$last_time = time();
		async_checkpoint_update();
	}
	return $last_time;
}

function async_checkpoint_update()
{
	$mem = new Memcached(CHECKPOINT_POOL);
	$ss = $mem->getServerList();
	if (empty($ss)) {
		$mem->addServer(MEMC_HOST, MEMC_PORT);
	}

	$mem->set(CHECKPOINT_TIME_KEY, time());
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

?>
