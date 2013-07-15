<?php
require_once 'config.php';
require_once 'functions.php';


counter(COUNT_IN_BINDING);
/*
$DATA['device']
$DATA['platform']
$DATA['caption']
$DATA['username']
$DATA['nickname']
*/
$DATA = array_merge($_GET, $_POST); 

loglocal(date(DATE_RFC822).' on_account_binding '.@$DATA['username'].' '.$DATA['nickname']);

?>
