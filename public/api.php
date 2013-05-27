<?php
require_once 'memcache_array.php';
require_once 'functions.php';
require_once 'config.php';
require_once 'geoipcity.php';

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
$referer = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($referer ? ($referer['scheme'].'://'.$referer['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: text/html; charset=utf-8');

if (isset($_GET['cmd']) or isset($_POST['cmd'])) goto label_api_mode;

if (!ini_get("browscap")) {
	echo '请配置browscap.ini';
	exit();
}

/*
ini_set("log_errors", 1);
ini_set("error_log", "/var/log/php_errors.log");
*/
$device_browser_list  = mmc_array_values(NS_DEVICE_LIST);
$device_platform_list = mmc_array_keys(NS_BINDING_LIST);

if (isset($_GET['debug'])) {
	$device_count = mmc_array_length(NS_DEVICE_LIST);
	$binding_count = 0;
	foreach($device_platform_list as $platform) {
		$binding_count += mmc_array_length(NS_BINDING_LIST.$platform);
	}

	$memcache_obj = new Memcache; 
	$memcache_obj->connect(MEMC_HOST, MEMC_PORT); 
	$stats = $memcache_obj->getStats();
	$memcache_obj->close();

	$dbg_print = '开始时间: '.getDateStyle($stats['time']-$stats['uptime']);
	$dbg_print .= ' 使用内存: '.bytesToSize($stats['bytes']).'/'.bytesToSize($stats['limit_maxbytes']).'<br>';
	$dbg_print .= '维护时间：'.getDateStyle(async_checkpoint_time());
	$dbg_print .= ' 维护设备数: '.$device_count.'  活跃设备数: '.count($device_browser_list);
	$dbg_print .= '  绑定设备数: '.$binding_count.'<br>';

	$xmlStr = file_get_contents('http://'.$_SERVER['SERVER_NAME'].'/channels-stats');
	$channels = json_decode($xmlStr);

	$dbg_print .= '推送开始: '.getDateStyle(time() - $channels->uptime).' 频道数: '.$channels->channels;
	$dbg_print .= ' 订阅数: '.$channels->subscribers.' 消息数: '.$channels->published_messages.'<br>';
	echo $dbg_print;
}

$aDataSet = [];
foreach($device_browser_list as $browser_json) 
{
	$browser = json_decode($browser_json);
	if (empty($browser)) {
		continue;
	}

	$device = $browser->device;

	$account_info = ' ';
	foreach($device_platform_list as $platform) 
	{
		$ns_binding = NS_BINDING_LIST.$platform;
		$account_json = mmc_array_get($ns_binding, $device);

		if (empty($account_json)) {
			continue;
		}

		$account = json_decode($account_json);

		$username = isset($account->username)? $account->username : null;
		$nickname = isset($account->nickname)? $account->nickname : null;
		$show_name = $nickname ? $nickname : ($username ? $username : null);

		if (empty($show_name)) {
			continue;
		}

		$caption = mmc_array_caption($ns_binding);
		$got_user = $show_name.'@'.$caption;

		if ($account_info == ' ') {
			$account_info = $got_user;
		} else {
			$account_info .= '; '.$got_user;
		}
	}

	$account = ($account_info == ' ')? '未知' : trim($account_info);
	$ref_obj = ($browser->visiting)? parse_url($browser->visiting) : null;
	$visiting = $ref_obj['host'];
	$region = get_city_name($browser->region);
	if (empty($region)) {
		$region = $browser->region;
	}
	$is_mobile = ($browser->ismobiledevice)? '是' : '不是';

	$aDataSet[] = [$account,$region,$visiting,$browser->browser,$browser->platform,$is_mobile,$browser->device];
}

?>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<link rel="shortcut icon" type="image/ico" href="http://dynamic.appgame.com/images/favicon.ico" />
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
		<div id='dynamic' style='width:100%; margin-top:22px;'></div>
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
