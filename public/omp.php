<?php

echo 'ok';

define('OMP_DOMAIN_NAME', 'omp.cn');
define('PROXY_HOST', 'localhost');
define('PROXY_PORT', 3128);

$in_type 	= $_GET['type'];
$in_cmd  	= $_GET['cmd'];
$in_message  	= $_GET['msg'];
$in_device_id	= $_GET['device'];
$in_platform	= $_GET['plat'];
$in_username	= $_GET['user'];
$in_nickname	= $_GET['nick'];

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
$referer = parse_url($http_referer);
header('Access-Control-Allow-Origin: '.($referer ? ($referer['scheme'].'://'.$referer['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');

?>
