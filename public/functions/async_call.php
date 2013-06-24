<?php

define('ME_USERAGENT', 'async_routine');
define('CURL_DEBUG', false);

function is_from_async()
{
	return ($_SERVER['HTTP_USER_AGENT'] == ME_USERAGENT);
}

//still has error
function call_async_fsockopen($script_path,$data=null)
{
	if (empty($data)) {
		$out  = "GET {$script_path} HTTP/1.1\r\n";
		$out .= "Host: {$_SERVER['SERVER_NAME']}\r\n";
		$out .= 'User-Agent: '.ME_USERAGENT."\r\n";
		$out .= "Connection: Close\r\n";
	} else {
		$post = '';
		while(list($k,$v) = each($data)){
			$post.= rawurlencode($k)."=".rawurlencode($v)."&";
		}
		$len = strlen($post);

		$out  = "POST {$script_path} HTTP/1.1\r\n";
		$out .= "Host: {$_SERVER['SERVER_NAME']}\r\n";
		$out .= 'User-Agent: '.ME_USERAGENT."\r\n";
		$out .= "Content-type: application/x-www-form-urlencoded\r\n";
		$out .= "Connection: Close\r\n";
		$out .= "Content-Length: {$len}\r\n";
		$out .= "\r\n";
		$out .= $post."\r\n";
	}

	$fp = @fsockopen('127.0.0.1',$_SERVER['SERVER_PORT'],$errno,$errstr,3);

	if ($fp) {
		fwrite($fp,$out);
		stream_set_timeout($fp, 3);

		if ("HTTP/1.1 200 OK\r\n" === fgets($fp)) {
			fclose($fp);
			return 'ok';
		}
	}
	fclose($fp);
	return 'no';
}

function call_async_php($script_path, $data=null)
{
	return call_async_curl($script_path, $data);
	return call_async_fsockopen($script_path, $data);
}

function call_async_curl($script_path, $data=null)
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

	if (CURL_DEBUG) {
		$curl_opt[CURLOPT_VERBOSE] = true;
		$curl_opt[CURLINFO_HEADER_OUT] = true;
	}


	$ch = curl_init();
	curl_setopt_array($ch, $curl_opt);
	curl_exec($ch);

	if (CURL_DEBUG) {
		$no = curl_errno($ch);
		if ($no) {
			file_put_contents('debug.log', 'errno: '.$no."\n", FILE_APPEND);
			file_put_contents('debug.log', print_r(curl_getinfo($ch), true)."\n", FILE_APPEND);
		}
	}

	curl_close($ch);
}


?>
