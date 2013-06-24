<?php 

require_once 'functions/async_call.php';

echo call_async_fsockopen('/on_test.php', array('stata'=>'adfadsf', 'fasasdf'=>'adfsdfsdf'));
exit();




require_once 'config.php';
require_once 'FSM.php';

$stack = array();
$fsm = new FSM('START', $stack);

print_r2($channels);

phpinfo();

function print_r2($val){
	echo '<pre>';
	print_r($val);
	echo  '</pre>';
}
?>
