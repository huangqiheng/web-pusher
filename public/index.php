<?php
require_once 'functions.php';
require_once 'functions/geoipcity.php';
require_once 'functions/auth.php';
require_once 'functions/device_name.php';

AUTH_ENABLE && force_login();

header('Content-Type: text/html; charset=utf-8');

if (VIEW_REGION) {
	if (!ini_get("browscap")) {
		echo '请配置browscap.ini';
		exit();
	}
}

/*
ini_set("log_errors", 1);
ini_set("error_log", "/var/log/php_errors.log");
*/

$device_browser_all = mmc_array_all(NS_DEVICE_LIST);
$device_online_list = array_keys($device_browser_all);
$device_browser_list = array_values($device_browser_all);
$device_platform_list = mmc_array_keys(NS_BINDING_LIST);

time_print('性能分析：取列表：');

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

	$dbg_print = '开始时间：'.getDateStyle($stats['time']-$stats['uptime']);
	$dbg_print .= ' 使用内存: '.bytesToSize($stats['bytes']).'/'.bytesToSize($stats['limit_maxbytes']).'<br>';
	$dbg_print .= '清理时间：'.getDateStyle(async_checkpoint_time());
	$dbg_print .= ' 维护设备数: '.$device_count.'  活跃设备数: '.count($device_browser_list);
	$dbg_print .= '  绑定账户数: '.$binding_count.'<br>';

	$xmlStr = file_get_contents('http://'.$_SERVER['SERVER_NAME'].'/channels-stats');
	$channels = json_decode($xmlStr);

	$dbg_print .= '推送开始：'.getDateStyle(time() - $channels->uptime).' 频道数: '.$channels->channels;
	$dbg_print .= ' 订阅数: '.$channels->subscribers.' 消息数: '.$channels->published_messages.'<br>';
	echo $dbg_print;
}


/******************************************************
预处理：获取user agent得到的get_browser对象
******************************************************/
$ua_browser_md5 = array();

foreach($device_browser_list as $browser) 
{
	$digest = md5(@$browser['useragent']);
	if (!$digest) {
		continue;
	}

	if (in_array($digest, $ua_browser_md5)) {
		continue;
	}
	$ua_browser_md5[] = $digest;
}

$mem = api_open_mmc();
$ua_browser_cache = $mem->ns_getMulti(GET_BROWSER, $ua_browser_md5);

function get_browser_cached($useragent)
{
	global $ua_browser_cache;
	$digest = md5($useragent);
	$res_cached = @$ua_browser_cache[$digest];
	if ($res_cached) {
		return $res_cached;
	}

	$browser_o = get_browser($useragent);
	$mem = api_open_mmc();
	$mem->ns_set(GET_BROWSER, $digest, $browser_o, GET_BROWSER_EXPIRE);
	return $browser_o;
}
time_print('UA表('.count($ua_browser_cache).'/'.count($ua_browser_md5).')：');


/******************************************************
预处理：获取user agent对应的设备名称
******************************************************/

$device_name_list = [];
$ua_device_cache = $mem->ns_getMulti(GET_DEVICE, $ua_browser_md5);

function get_device_cached($useragent)
{
	$digest = md5($useragent);
	global $ua_device_cache;
	$res_cached = @$ua_device_cache[$digest];
	if ($res_cached) {
		return $res_cached;
	}

	$device_name  = get_device_name($useragent);
	$mem = api_open_mmc();
	$mem->ns_set(GET_DEVICE, $digest, $device_name, GET_DEVICE_EXPIRE);
	return $device_name;
}

time_print('设备表('.count($ua_device_cache).'/'.count($ua_browser_md5).')：');

/******************************************************
预处理：ip地区映射列表
******************************************************/

if (VIEW_REGION) {
	$ip_list = array();

	foreach($device_browser_list as $browser) 
	{
		$ip = $browser['region'];

		if (in_array($ip, $ip_list)) {
			continue;
		}

		$ip_list[] = $ip;
	}

	$ip_locale_cache = $mem->ns_getMulti(GET_LOCALE, $ip_list);
	time_print('地区表('.count($ip_locale_cache).'/'.count($ip_list).')：');
}

function get_locale_cached($ip)
{
	global $ip_locale_cache;
	$res_cached = @$ip_locale_cache[$ip];
	if ($res_cached) {
		return $res_cached;
	}

	$res = get_city_name($ip);
	$mem = api_open_mmc();
	$mem->ns_set(GET_LOCALE, $ip, $res, GET_LOCALE_EXPIRE);
	return $res;
}


/******************************************************
预处理：账户绑定列表
******************************************************/

$account_list = [];
foreach($device_platform_list as $platform) {
	$ns_binding = NS_BINDING_LIST.$platform;
	$account_list[mmc_array_caption($ns_binding)] = mmc_array_all($ns_binding);
}

function get_binding_name($device)
{
	global $account_list;
	$account_info = ' ';
	foreach($account_list as $caption=>$bind_platform) {
		$account = @$bind_platform[$device];
		if (empty($account)) {
			continue;
		}

		$username = $account['username'];
		$nickname = $account['nickname'];
		$show_name = $nickname ? $nickname : ($username ? $username : null);

		if (empty($show_name)) {
			continue;
		}

		$got_user = $show_name.'@'.$caption;

		if ($account_info == ' ') {
			$account_info = $got_user;
		} else {
			$account_info .= '; '.$got_user;
		}
	}

	return ($account_info == ' ')? '--' : trim($account_info);
}

time_print('账户表：');

$aDataSet = [];
foreach($device_browser_list as $browser) 
{
	if (empty($browser)) {
		continue;
	}
	$device = $browser['device'];
	$useragent = $browser['useragent'];
	$browser_o = get_browser_cached($useragent);
	$device_name = get_device_cached($useragent);
	$account = get_binding_name($device);

	$ref_obj = ($browser['visiting'])? parse_url($browser['visiting']) : null;
	$visiting = $ref_obj['host'];
	$is_mobile = ($browser_o->ismobiledevice)? 'mobi' : 'desk';

	VIEW_REGION ? ($region = get_locale_cached($browser['region'])) : ($region = $browser['region']);
	empty($region) && ($region = $browser['region']);

	$aDataSet[] = [$account,$region,$visiting,$browser_o->browser,$browser_o->platform,
			$is_mobile,$device_name,$browser['device']];
}

time_print('整合：');
if (isset($_GET['debug'])) {
	echo time_print();
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
	
	@import "datatables/demo_page.css"; 
	@import "datatables/header.ccss";
	@import "datatables/demo_table.css";
	@import "datatables/TableTools.css";
</style>
<link rel="stylesheet" href="jqwidgets/styles/jqx.base.css" type="text/css" />
<script type="text/javascript" language="javascript" src="js/jquery.min.js"></script>
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
<script type="text/javascript" src="jqwidgets/jqxtabs.js"></script>
<script type="text/javascript" language="javascript" src="datatables/jquery.dataTables.min.js"></script>
<script type="text/javascript" language="javascript" src="datatables/TableTools.js"></script>
<script type="text/javascript" language="javascript" src="datatables/ZeroClipboard.js"></script>
<script type="text/javascript" charset="utf-8">
var aDataSet = <?php echo json_encode($aDataSet); ?>;
var nTotalItem = <?php echo count($aDataSet); ?>;
api_ui_init(aDataSet);

function api_ui_init(aDataSet)
{
	$(document).ready(function() {
		$('#dynamic').html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');
		var oTable = $('#example').dataTable( {
			'bJQueryUI': true,
			//'sPaginationType': 'full_numbers',
			//'iDisplayLength': nTotalItem,
			"bLengthChange": false,
			"bPaginate": false,
			'aaData': aDataSet,
			'aaSorting': [[0,'desc']],
			'bStateSave': true,
			'aoColumns': [
				{ 'sTitle': '在线账户'},
				{ 'sTitle': '来源地区'},
				{ 'sTitle': '正在访问'},
				{ 'sTitle': '浏览器', 'sClass': 'center'},
				{ 'sTitle': '操作系统', 'sClass': 'center'},
				{ 'sTitle': '移动', 'sClass': 'center'},
				{ 'sTitle': '设备', 'sClass': 'center'},
				{ 'sTitle': '设备ID',   'bVisible': false},
			],

			"sDom": '<"H"Tfr>t<"F"ip>',
			//"sDom": 'T<"clear">lfrtip',
			'oTableTools': {
				'sRowSelect': 'multi',
				'aButtons': [
				{
					"sExtends":    "select",
					"sButtonText": "全选",
					"fnClick": function (nButton, oConfig, oFlash) {
						var oTT = TableTools.fnGetInstance('example');
						oTT.fnSelectAll(true); 					
					}

				},
				{
					"sExtends":    "select_none",
					"sButtonText": "不选",
				},
				{
					"sExtends":    "text",
					"sButtonText": "刷新",
					"fnClick": function (nButton, oConfig, oFlash) {
						window.location.href = window.location.href;
					}

				},
				],
			},
			"oLanguage": {
				"oPaginate": {
					'sFirst': '首页',
					'sLast': '尾页',
					'sNext': '下页',
					'sPrevious': '前页',
				},
				'sSearch': '搜索: ',
				'sEmptyTable': '没人在线',
				'sInfoFiltered': '，过滤自_MAX_条记录',
				'sInfo': '共_TOTAL_个设备，显示从第_START_个到第_END_个',
			}

		});	

		$("#example").on('click','tr',
			function(event) {
				var oTT = TableTools.fnGetInstance( 'example' );
				var obj = $(this);

				if (oTT.fnIsSelected(this)) {
				oTT.fnDeselect(obj);
				} else {
				oTT.fnSelect(obj);
				}
			});

		var theme = '';

		var source = ['通知','活动通知','抽奖活动','紧急通知','会议通知'];
		$("#notify-title").jqxComboBox({theme: theme,source: source, selectedIndex:0, width:80, height:28});

		var countries = new Array();
		$("#notify-content").jqxInput({theme: theme,placeHolder:"请输入通知内容",source:countries,width:445,height:28});
		$("#send-button").jqxButton({ width: 76, height:30, theme: theme });

		$("#send-button").on('click', send_omp_message);

		$("#property-panel").jqxPanel({theme: theme, height: 30, width:431, theme: theme });

		var source = ['实时消息','异步消息'];
		$("#message-mode").jqxDropDownList({source:source, selectedIndex:1,width: 76, height: 28, theme: theme });

		$("#notify-ttl").jqxNumberInput({theme: theme,symbol:'秒',symbolPosition:'right',min:1,decimal:8,decimalDigits:0,width:55,height:28, inputMode:'simple',spinButtons:true});
		$("#notify-ttl").jqxTooltip({theme: theme, content: '通知延迟关闭时间', position: 'mouse'});

		var source = ['自动消退','固定显示'];
		$("#issticky").jqxDropDownList({source:source, selectedIndex:0,width: 76, height: 28, theme: theme });

		var source = ['没有警示','强制警示'];
		$("#iswarnning").jqxDropDownList({source:source, selectedIndex:0,width: 76, height: 28, theme: theme });

		var source_posi = ['左上方','左下方','右上方','右下方'];
		$("#viewposi").jqxDropDownList({source:source_posi, selectedIndex:2,width: 62, height: 28, theme: theme });

		$('#jqxTabs').jqxTabs({
			width:'100%',position:'top',theme:theme,
			animationType: 'fade',
			contentTransitionDuration: 500,
			scrollable:false,
			});
	});

	function send_omp_message() {
		var oTT = TableTools.fnGetInstance( 'example' );

		var aData = oTT.fnGetSelectedData();
		var target_devices = new Array();
		$.each(aData, function() {
			target_devices.push(this[7]);
			});

		if (target_devices.length == 0) {
			console.log('no target');
			return;
		}

		var title = $('#notify-title').jqxComboBox('val');
		var content = $('#notify-content').val();
		var issticky = $("#issticky").jqxDropDownList('getSelectedIndex'); 
		var iswarnning = $("#iswarnning").jqxDropDownList('getSelectedIndex'); 
		var viewposi = $("#viewposi").jqxDropDownList('getSelectedIndex'); 
		var ttl = $('#notify-ttl').jqxNumberInput('getDecimal');
		var msgmod = $("#message-mode").jqxDropDownList('getSelectedIndex');

		var source_posi = ['top-left','bottom-left','top-right','bottom-right'];
		var source_bool = [false,true];
		var source_msgmod = ['realtime', 'heartbeat'];
		var device_id = document.cookie.match(new RegExp("(^| )device_id=([^;]*)(;|$)"));
		device_id = device_id? device_id[2] : 'null';

		var cmdbox = new Object();
		cmdbox.title = title;
		cmdbox.text = content;
		cmdbox.sticky = source_bool[issticky];
		cmdbox.before_open = source_bool[iswarnning];
		cmdbox.msgmod = source_msgmod[msgmod];
		cmdbox.time = 	ttl*1000;
		cmdbox.position = source_posi[viewposi];
/*
		$.post("api.php", {
				cmd: 	'sendmessage',
				target: escape(JSON.stringify(target_devices)),
				cmdbox: escape(JSON.stringify(cmdbox)),
			}, function(data,status) {
				console.log(status + ': ' +  data);
			}
		);
*/
		jQuery.ajax({
			type: 'POST',
			url: 'api.php',
			beforeSend: function(xhrObj){
				xhrObj.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
				xhrObj.setRequestHeader("Accept","application/json");
			},
			dataType:"text", 
			data: {
				cmd: 	'sendmessage',
				target: target_devices,
				cmdbox: cmdbox,
			},
			success: function(msg) {
				console.log(msg);
			}
		});
	};
}

</script>
<style type='text/css'>
	div#property-panel {
		width: 358px; 
		border: none;
	}
	div.jqx-tabs-content-element {
		height:auto;
		overflow: hidden;
	}
	div.DTTT_container.ui-buttonset {
		margin-bottom:0px !important;
	}
	input[name='notify-ttl'] {
		height: 28px !important;
	}
	table#example {
		font-size:13px !important;
		width:100% !important; 
	}
	#content {
		min-width: 600px; 
		max-width: 960px; 
		margin: auto;
	}
	div#example_filter input {
		width: 260px !important;
		height: 26px !important;
	}
	#message {
		width:100%; 
		height:30px;
		margin-top:10px;
	}
	.jqx-widget-header {
		background: rgb(173, 173, 173);
	}
</style>
</head>
<body background="images/bg_tile.jpg">
	<div id='content'>
		<div id='jqxTabs'>
			<ul>
				<li style="margin-left: 30px;">
					<img style='float: left;' width='16' height='16' src="/images/mailIcon.png" alt="" class="small-image" />
					<div style="float: left;">发送即时信息</div>
				</li>

				<li>
					<img style='float: left;' width='16' height='16' src="/images/calendarIcon.png" alt="" class="small-image" />
					<div style="float: left;">计划任务消息</div>
				</li>

				<li>
					<img style='float: left;' width='16' height='16' src="/images/settings.png" alt="" class="small-image" />
					<div style="float: left;">系统配置</div>
				</li>
			</ul>
		
			<div>
				<div id='message'>
					<div id="notify-title" style='float:left;'></div>
					<input id="notify-content" type="text" style='float:left;'/>
					<div id='property-panel' style='float:right;'>
						<input id='send-button' type="button" value="发送" style='float:left;' />
						<div id='message-mode' style='float: left;'></div>
						<div id='viewposi' style='float: left;'></div>
						<div id='notify-ttl' style='float:left;'></div>
						<div id='issticky' style='float: left;'></div>
						<div id='iswarnning' style='float: left;'></div>
					</div>
				</div>
				<div id='dynamic'></div>
			</div>

			<div style='height:380px;'>
			</div>

			<div style='height:380px;'>
			</div>
		</div>
	</div>
</body>
</html>

