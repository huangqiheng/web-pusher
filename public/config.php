<?php
define('PUSHER_DOMAIN', 'appgame.com');
define('PUSHER_HOST', 'localhost');
define('PUSHER_PORT', 80);
define('MEMC_HOST', '127.0.0.1');
define('MEMC_PORT', 11211);
define('COOKIE_TIMEOUT', 3600*24*365*100);
define('CACHE_EXPIRE_SECONDS', 60*5);
define('COOKIE_DEVICE_ID', 'device_id');

define('NS_DEVICE_LIST', 'ns_device_list');
define('NS_BINDING_LIST', 'ns_binding_list');

define('CHECKPOINT_POOL', 'async_checkpoint_pool');
define('CHECKPOINT_TIME_KEY', 'async_check_time'); 
define('CHECKPOINT_INTERVAL', 60*10);

?>
