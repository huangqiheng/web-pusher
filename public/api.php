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

$device_browser_list  = mmc_array_all(NS_DEVICE_LIST);
$device_user_list = mmc_array_all(NS_BINDING_LIST);
$aDataSet = [];

foreach($device_browser_list as $device) 
{
	$browser_json = mmc_array_get(NS_DEVICE_LIST, $device);
	if (empty($browser_json)) {
		continue;
	}

	$browser = json_decode($browser_json);
	if (empty($browser)) {
		continue;
	}

	$account_info = ' ';
	foreach($device_user_list as $platform) 
	{
		$ns_binding = NS_BINDING_LIST.$platform;
		$caption = mmc_array_caption($ns_binding);
		$device_list = mmc_array_all($ns_binding);

		if (!in_array($device, $device_list)) { 
			continue;
		}	

		$account_json = mmc_array_get($ns_binding, $device);
		$account = json_decode($account_json);
		$username = isset($account->username)? $account->username : null;
		$nickname = isset($account->nickname)? $account->nickname : null;
		$show_name = $nickname ? $nickname : ($username ? $username : null);

		if (empty($show_name)) {
			continue;
		}

		$got_user = $show_name.'@'.$caption;
		if (!is_utf8($got_user)) {
			$got_user = iconv("gb2312","utf-8//IGNORE",$got_user);
		}

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

	$aDataSet[] = [$account, $region, $visiting, $browser->browser, $browser->platform, $is_mobile, $browser->device];
}

function is_utf8($string) 
{
	// From http://w3.org/International/questions/qa-forms-utf-8.html
	return preg_match('%^(?:
	[\x09\x0A\x0D\x20-\x7E] # ASCII
	| [\xC2-\xDF][\x80-\xBF] # non-overlong 2-byte
	| \xE0[\xA0-\xBF][\x80-\xBF] # excluding overlongs
	| [\xE1-\xEC\xEE\xEF][\x80-\xBF]{2} # straight 3-byte
	| \xED[\x80-\x9F][\x80-\xBF] # excluding surrogates
	| \xF0[\x90-\xBF][\x80-\xBF]{2} # planes 1-3
	| [\xF1-\xF3][\x80-\xBF]{3} # planes 4-15
	| \xF4[\x80-\x8F][\x80-\xBF]{2} # plane 16
	)*$%xs', $string);
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
