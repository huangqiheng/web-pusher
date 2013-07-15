<?php
require_once 'functions.php';

loglocal(date(DATE_RFC822).' on_sched_handler');

if (!is_from_async()) {die();}
if (!is_sched_changed()) {die();}

$sched_list   = mmc_array_values(DATA_SCHED_LIST);
$users_list   = mmc_array_values(DATA_USER_LIST);
$message_list = mmc_array_values(DATA_MESSAGE_LIST);

/*
{name: 'name', type: 'string'},
{name: 'tags', type: 'string'},
{name: 'new_user', type: 'string'},
{name: 'new_visitor', type: 'string'},
{name: 'ismobiledevice', type: 'string'},
{name: 'binded', type: 'string'},
{name: 'browser', type: 'string'},
{name: 'platform', type: 'string'},
{name: 'device_name', type: 'string'},
{name: 'UserAgent', type: 'string'},
//上面可在分发任务时判断，下面需要实时判断
{name: 'region', type: 'string'},
{name: 'bind_account', type: 'string'},
{name: 'Visiting', type: 'string'}
*/
function make_target_clients($target_device)
{
	$targets = explode(',', $target_device);

}

function make_message_objects($sched_msg)
{

}

/*
	sched_list
{name: 'name', type: 'string'},
{name: 'status', type: 'string'},
{name: 'start_time', type: 'date'},
{name: 'finish_time', type: 'date'},
{name: 'times', type: 'string'},
{name: 'time_interval', type: 'string'},
{name: 'time_interval_mode', type: 'string'},
{name: 'msg_sequence', type: 'string'},
{name: 'repel', type: 'string'},
{name: 'target_device', type: 'string'},
{name: 'sched_msg', type: 'string'}

	users_list

	message_list
{name: 'name', type: 'string'},
{name: 'tags', type: 'string'},
{name: 'title', type: 'string'},
{name: 'text', type: 'string'},
{name: 'msgmod', type: 'string'},
{name: 'position', type: 'string'},
{name: 'sticky', type: 'string'},
{name: 'time', type: 'string'},
{name: 'before_open', type: 'string'}
?>
