<?php
require_once 'functions.php';
require_once 'config.php';

loglocal(date(DATE_RFC822).' on_cleanup_list');

echo mmc_array_cleanup(NS_DEVICE_LIST, time()-CHECKPOINT_INTERVAL);

die();

?>
