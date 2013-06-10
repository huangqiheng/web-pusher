<?php
require_once 'config.php';
require_once 'functions.php';

/*
$DATA['device']
$DATA['platform']
$DATA['caption']
$DATA['username']
$DATA['nickname']
*/
$DATA = array_merge($_GET, $_POST); 
$device = $DATA['device'];

//记录已经绑定的账户
$new_key = md5($DATA['caption'].'@'.$DATA['platform'].'@'.$device);
$new_val = md5($DATA['username'].'('.$DATA['nickname'].')@'.$device);

$mem = api_open_mmc();

$changed = false;

if ($binded_list = $mem->ns_get(NS_BINDED_LIST, $device)) {
	if ($binded_list[$new_key] !== $new_val) {
		$binded_list[$new_key] = $new_val;
		$changed = true;
	}
} else {
	$binded_list[$new_key] = $new_val;
	$changed = true;
}

if ($changed) {
	$mem->ns_set(NS_BINDED_LIST, $device, $binded_list); 
}

?>
