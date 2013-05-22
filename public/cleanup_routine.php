<?php
require_once 'memcache_array.php';
require_once 'config.php';

echo mmc_array_cleanup(NS_DEVICE_LIST, time()-CHECKPOINT_INTERVAL);

?>
