<?php 

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
