<?php

define('ME_USERAGENT', 'async_routine');

function is_from_async()
{
	return ($_SERVER['HTTP_USER_AGENT'] == ME_USERAGENT);
}


function call_async_php($script_path)
{
	$url = 'http://127.0.0.1:'.$_SERVER['SERVER_PORT'].$script_path;
	$headers = array(
		'Host: '.$_SERVER['SERVER_NAME'],
		'User-Agent: '.ME_USERAGENT,
	);

	$curl_opt = array(
		CURLOPT_URL => $url,
		CURLOPT_HTTPHEADER => $headers,
		CURLOPT_PORT => $_SERVER['SERVER_PORT'], 
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_NOSIGNAL => 1,
		CURLOPT_CONNECTTIMEOUT_MS => 3000,
		CURLOPT_TIMEOUT_MS =>  1,
	//	CURLOPT_VERBOSE => true,
	//	CURLINFO_HEADER_OUT => true,
	);

	$ch = curl_init();
	curl_setopt_array($ch, $curl_opt);
	curl_exec($ch);
	curl_close($ch);
}

?>
