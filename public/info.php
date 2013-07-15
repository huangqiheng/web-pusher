<?php 

require_once 'functions.php';

$lasttime = async_timer_test('/on_sched_handler.php', 10);
echo date(DATE_RFC822, $lasttime);


function async_timer_test ($script_path, $time_interval=null)
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

	echo 'run call_async_test';
	
	call_async_test($script_path);
	return $new_item;
}

function call_async_test($script_path, $data=null)
{
	$headers = array(
		'Host: '.$_SERVER['SERVER_NAME'],
		'User-Agent: '.ME_USERAGENT,
	);
	
	$url = 'http://127.0.0.1:'.$_SERVER['SERVER_PORT'].$script_path;

	$curl_opt = array(
		CURLOPT_URL => $url,
		CURLOPT_HTTPHEADER => $headers,
		CURLOPT_PORT => $_SERVER['SERVER_PORT'], 
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_NOSIGNAL => 1,
		CURLOPT_CONNECTTIMEOUT_MS => 3000,
		CURLOPT_TIMEOUT_MS =>  1,
	);

	if ($data) {
		$curl_opt[CURLOPT_POST] = 1;
		$curl_opt[CURLOPT_POSTFIELDS] = http_build_query($data);
	}

	$curl_opt[CURLOPT_VERBOSE] = true;
	$curl_opt[CURLINFO_HEADER_OUT] = true;

	$ch = curl_init();
	curl_setopt_array($ch, $curl_opt);
	curl_exec($ch);

	$no = curl_errno($ch);
	if ($no) {
		print_r2('errno: '.$no."\n");
		print_r2(curl_getinfo($ch));
	}

	curl_close($ch);
}

function print_r2($val){
	echo '<pre>';
	print_r($val);
	echo  '</pre>';
}
?>
