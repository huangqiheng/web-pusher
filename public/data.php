<?php
require_once 'functions.php';

switch($_GET['cmd']) {
	case 'message': die(handle_list_command(DATA_MESSAGE_LIST, $_GET['opt']));
	case 'user': 	die(handle_list_command(DATA_USER_LIST,    $_GET['opt']));
	case 'sched': 	die(handle_list_command(DATA_SCHED_LIST,   $_GET['opt']));
	default: 	die('{"res": false}');
}
exit();


function handle_list_command($list_name, $cmd_name) 
{
	switch($cmd_name) {
		case 'list':   return jsonp(mmc_array_values($list_name));
		case 'create': 
			sched_changed();
			return jsonp(mmc_array_set($list_name, $_POST['name'], $_POST));
		case 'update': 
			sched_changed();
			return jsonp(mmc_array_set($list_name, $_POST['name'], $_POST));
		case 'delete': 
			sched_changed();
			return jsonp(mmc_array_del($list_name, $_POST['name']));
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