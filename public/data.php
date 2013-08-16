<?php
require_once 'functions.php';
require_once 'sched_list.php';

switch($_GET['cmd']) {
	case 'message': die(handle_list_command(DATA_MESSAGE_LIST, $_GET['opt']));
	case 'user': 	die(handle_list_command(DATA_USER_LIST,    $_GET['opt']));
	case 'sched': 	die(handle_list_command(DATA_SCHED_LIST,   $_GET['opt']));
	case 'plans': 	die(handle_list_command(DATA_PLANS_LIST,   $_GET['opt']));
	case 'posi':	die(handle_list_command(DATA_POSI_LIST,    $_GET['opt']));
	case 'status':  die(handle_sched_status(DATA_SCHED_LIST,   $_GET['key'], $_GET['val']));
	default: 	die('{"res": false}');
}
exit();

function result_ok($obj)
{
	update_sched_tasks();
	sched_changed();
	return  jsonp(['status'=>'ok', 'result'=>$obj]);
}

function handle_sched_status($list_name, $task_id,  $status)
{
	$mod_task = mmc_array_get($list_name, $task_id);
	$mod_task['status'] = $status;
	return result_ok(mmc_array_set($list_name, $task_id, $mod_task));
}

function handle_list_command($list_name, $cmd_name) 
{
	switch($cmd_name) {
		case 'list':   
			$res = mmc_array_values($list_name);
			if (count($res) === 0) {
				update_sched_tasks($list_name);
				$res = mmc_array_values($list_name);
			}
			return jsonp($res);
		case 'create': return result_ok(mmc_array_set($list_name, md5($_POST['name']), $_POST));
		case 'update': return result_ok(mmc_array_set($list_name, md5($_POST['name']), $_POST));
		case 'delete': return result_ok(mmc_array_del($list_name, md5($_POST['name'])));
		case 'flush':  
			sched_changed();
			return '{"res": false}';
		case 'names':  
			return jsonp(mmc_array_keys($list_name));
		case 'tags': 
			$items = mmc_array_values($list_name);
			$output_tags = [];
			foreach($items as $item) {
				$tags = @$item['tags'];
				if ($tags) {
					$tag_list = explode(' ', $tags);
					foreach($tag_list as $tag) {
						$output_tags[] = $tag;
					}
				}
			}
			return jsonp($output_tags);
		default:       
			die('{"res": false}');
	}
}



?>
