<?php
require_once 'functions.php';
require_once 'sched_list.php';

switch($_GET['cmd']) {
	case 'message': die(handle_list_command(DATA_MESSAGE_LIST, $_GET['opt']));
	case 'user': 	die(handle_list_command(DATA_USER_LIST,    $_GET['opt']));
	case 'sched': 	die(handle_list_command(DATA_SCHED_LIST,   $_GET['opt']));
	case 'replace': die(handle_list_command(DATA_PLANS_LIST,   $_GET['opt']));
	case 'posi':	die(handle_list_command(DATA_POSI_LIST,    $_GET['opt']));
	case 'accnt_ident':die(handle_list_command(DATA_ACCNT_IDENT_LIST,    $_GET['opt']));
	case 'kword_ident':die(handle_list_command(DATA_KWORD_IDENT_LIST,    $_GET['opt']));
	case 'submt_ident':die(handle_list_command(DATA_SUBMT_IDENT_LIST,    $_GET['opt']));
	case 'keyword': die(handle_list_command(DATA_KEYWORD_LIST,    $_GET['opt']));
	case 'status':  die(handle_sched_status($_GET['list'], $_GET['key'], $_GET['val']));
	default: 	die('{"res": false}');
}
exit();

function result_ok($obj)
{
	//$e = new Exception;
	//loglocal($e->getTraceAsString());

	update_sched_tasks();
	sched_changed();
	return  jsonp(['status'=>'ok', 'result'=>$obj]);
}

function handle_sched_status($list_name, $task_id,  $status)
{
	$mod_task = mmc_array_get($list_name, $task_id);

	if (empty($mod_task)) {
		return jsonp(['stauts'=>'no', 'result'=>'error']);
	}

	if (array_key_exists('finish_time', $mod_task)) {
		$mod_task['status'] = $status;
		return result_ok(mmc_array_set($list_name, $task_id, $mod_task));
	} else {
		return jsonp(['stauts'=>'no', 'result'=>'error']);
	}
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
		case 'create': 
		case 'update': 
			$key_name = @$_POST['name'];
			if ($key_name) {
				return result_ok(mmc_array_set($list_name, md5($key_name), $_POST));
			} else {
				return '{"res": false}';
			}
		case 'delete': 
			mmc_array_del($list_name, md5($_POST['name']));
			if (mmc_array_length($list_name) === 0) {
				del_cached_file($list_name);
			}
			return result_ok(true);
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
