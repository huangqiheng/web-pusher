<?php
require_once 'functions.php';
counter(COUNT_IN_HEARTBEAT);

$DATA = array_merge($_GET, $_POST); 
loglocal($DATA);

?>
