<?php
require_once 'memcache_array.php';
require_once 'functions.php';
require_once 'config.php';

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
$referer = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($referer ? ($referer['scheme'].'://'.$referer['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if (isset($_GET['cmd']) or isset($_POST['cmd'])) goto label_api_mode;

if (!ini_get("browscap")) {
	echo '请配置browscap.ini';
	exit();
}

$device_list  = mmc_array_all(NS_DEVICE_LIST);
$platform_list = mmc_array_all(NS_BINDING_LIST);
$aDataSet = [];

foreach($device_list as $device) {
	$user_agent = mmc_array_get(NS_DEVICE_LIST, $device);
	if (empty($user_agent)) {
		continue;
	}

	$browser = get_browser($user_agent, true);
	if (empty($browser)) {
		continue;
	}

	$is_mobile = ($browser['ismobiledevice'])? '是' : '不是';
	$row_item = [$device,$browser['browser'],$browser['platform'],$is_mobile];


	$account_info = ' ';
	foreach($platform_list as $platform) {
		$ns_binding = NS_BINDING_LIST.$platform;
		$caption = mmc_array_caption($ns_binding);
		$device_list = mmc_array_all($ns_binding);

		if (in_array($device, $device_list)) { 
			$account_json = mmc_array_get($ns_binding, $device);
			print_r($account_json);
			$account = json_decode($account_json);

			print_r($account);
			
			if (($account) and ($account['username'])) {
				$account_info .= $account['username'].'@'.$caption;
			}
		}	
	}
	$row_item[] = trim($account_info);
	$aDataSet[] = $row_item;
}

?>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<link rel="shortcut icon" type="image/ico" href="http://omp.cn/images/favicon.ico" />
<title>omp send message</title>
<style type="text/css" title="currentStyle">
	@import "css/demo_table_jui.css";
	@import "css/jquery-ui-1.8.4.custom.css";
</style>
<link rel="stylesheet" href="jqwidgets/styles/jqx.base.css" type="text/css" />
<script type="text/javascript" language="javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" language="javascript" src="js/jquery.dataTables.js"></script>
<script type="text/javascript" src="jqwidgets/jqxcore.js"></script>
<script type="text/javascript" src="jqwidgets/jqxinput.js"></script>
<script type="text/javascript" src="jqwidgets/jqxscrollbar.js"></script>
<script type="text/javascript" src="jqwidgets/jqxbuttons.js"></script>
<script type="text/javascript" src="jqwidgets/jqxpanel.js"></script>
<script type="text/javascript" src="jqwidgets/jqxlistbox.js"></script>
<script type="text/javascript" src="jqwidgets/jqxcombobox.js"></script>
<script type="text/javascript" src="jqwidgets/jqxnumberinput.js"></script>
<script type="text/javascript" src="jqwidgets/jqxtooltip.js"></script>
<script type="text/javascript" src="jqwidgets/jqxdropdownlist.js"></script>
<script type="text/javascript" src="js/api.ui.js"></script>
<script type="text/javascript" charset="utf-8">
	var aDataSet = <?php echo json_encode($aDataSet); ?>;
	api_ui_init(aDataSet);
</script>
</head>
<body background="images/bg_tile.jpg">
	<div id='content' style='min-width: 600px; max-width: 800px; margin: auto;'>
		<div id='message'>
			<div id="notify-title" style='float:left;'></div>
			<input id="notify-content" type="text" style='float:left;'/>
			<input id='send-button' type="button" value="发送" style='float:left;' />
			<div id='property-panel' style='float:left;'>
				<div id='viewposi' style='float: left;'></div>
				<div id='notify-ttl' style='float:left;'></div>
				<div id='issticky' style='float: left;'></div>
				<div id='iswarnning' style='float: left;'></div>
			</div>
		</div>
		<br>
		<div id='dynamic' style='margin-top:22px;'></div>
	</div>
</body>
</html>

<?php
exit();

label_api_mode:
    $cmd = $_POST['cmd'];
    if ($cmd == 'sendmessage') goto label_sendmessage;
    exit();

label_sendmessage:
    $target = urldecode($_POST['target']);
    $cmdbox = $_POST['cmdbox'];

    $device_list = json_decode($target);
    foreach($device_list as $device) {
    	if (send_message($device, $cmdbox)) {
		echo 'ok '.$device;
	} else {
		echo 'error '.$device;
	}
    }
    exit();

# 获取设备id和分类和发送
# get http://omp.cn/api.php?cmd=list&type=[device|browser|platform|mobile]
# post http://omp.cn/api.php?cmd=send&type=[device|browser|platform|mobile]&value=xxxxx

# 获取业务身份和发送
# get http://omp.cn/api.php?cmd=listplats
# get http://omp.cn/api.php?cmd=listrole&plat=tencent_qq
# post http://omp.cn/api.php?cmd=sendrole&plat=tencent_qq&username=xxxx&nickname=xxxx
?>
