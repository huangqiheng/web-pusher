<?php
require_once 'functions.php';
require_once 'functions/device_name.php';
require_once 'functions/geoipcity.php';
require_once 'config.php';

/*
$DATA['device']
$DATA['useragent']
$DATA['region']
$DATA['visiting']
$DATA['new_visitor']
*/
$DATA = array_merge($_GET, $_POST); 

$mem = api_open_mmc();

if ($useragent = @$DATA['useragent']) {
	$useragent = urldecode($useragent);
	$digest = md5($useragent);

	if (!($mem->ns_get(GET_BROWSER, $digest))) {
		if ($browser_o = get_browser($useragent)) {
			$mem->ns_set(GET_BROWSER, $digest, $browser_o, GET_BROWSER_EXPIRE);
		}
	}

	if (!($mem->ns_get(GET_DEVICE, $digest))) {
		if ($device_name  = get_device_name($useragent)) {
			$mem->ns_set(GET_DEVICE, $digest, $device_name, GET_DEVICE_EXPIRE);
		}
	}
}

if (VIEW_REGION) {
	$ip = @$DATA['region'];
	if (!($mem->ns_get(GET_LOCALE, $ip))) {
		$city_name = get_city_name($ip);
		!($city_name) && ($city_name = $ip);
		$mem->ns_set(GET_LOCALE, $ip, $city_name, GET_LOCALE_EXPIRE);
	}
}




?>
