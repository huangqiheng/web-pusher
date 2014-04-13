<?php
require_once 'functions.php';

counter(COUNT_IN_HEARTBEAT);
$DATA = array_merge($_GET, $_POST); 
$url = @$DATA['Visiting'];


if (!preg_match('#^http://([a-zA-Z0-9\-]+\.)*appgame\.com/([\S]+/)?[\d]+\.html$#i', $url)) {
	exit;
}

CachedHandler::queue('new-access-report', $url, function($items){
	$res = report_remote('http://db.appgame.com/service/spec/appgame.php', [
		'cmd' => 'event',
		'event' => 'new_articles',
		'urls' => $items
	]);
}, 60);

function logfile($obj)
{
	file_put_contents('debug.log', gmdate(time()).': '.print_r($obj,true)."\n", FILE_APPEND);
}

function report_remote($recv_url, $data)
{
	$curl_opt = array(
		CURLOPT_URL => $recv_url,
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_CONNECTTIMEOUT => 7,
		CURLOPT_TIMEOUT =>  10,
		CURLOPT_POST => 1,
		CURLOPT_POSTFIELDS => http_build_query($data)
	);

	$ch = curl_init();
	curl_setopt_array($ch, $curl_opt);
	$res = curl_exec($ch);

	$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$err = curl_errno($ch);
	curl_close($ch);
	return (($err) || ($httpcode !== 200))? null : $res;
}

