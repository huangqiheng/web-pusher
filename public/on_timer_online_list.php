<?php
require_once 'functions.php';

echo mmc_array_cleanup(NS_DEVICE_LIST, time()-CHECKPOINT_INTERVAL);

die();

?>
