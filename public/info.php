<?php 

require_once 'config.php';

$memcache_obj = new Memcache; 
$memcache_obj->connect(MEMC_HOST, MEMC_PORT); 
$stats = $memcache_obj->getStats();
$memcache_obj->close();

print_r2($stats);

$xmlStr = file_get_contents('http://'.$_SERVER['SERVER_NAME'].'/channels-stats');
$channels = json_decode($xmlStr);

print_r2($channels);

phpinfo();

function print_r2($val){
	echo '<pre>';
	print_r($val);
	echo  '</pre>';
}
?>
