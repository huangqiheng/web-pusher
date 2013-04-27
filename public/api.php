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


<script type="text/javascript" charset="utf-8">
    /* Data set - can contain whatever information you want */
    function add_device(device) 
    {
	device_list = window.devices;
	if (device_list == null) {
		device_list = new Array();
		window.devices = device_list;
	}
	device_list.push(device);
	return device_list;
    }
    
    function remove_device(device)
    {
	device_list = window.devices;
	if (device_list == null) {
		return new Array();
	}
	for(var i=device_list.length; i-- && device_list[i] !== device;);  
	if (i >= 0) device_list.splice(i,1); 
	return device_list;
    }

    function get_device()
    {
	device_list = window.devices;
	if (device_list == null) {
		return new Array();
	}
	return device_list;
    }

    var aDataSet = <?php echo json_encode($aDataSet) ?>	
    $(document).ready(function() {
	$('#dynamic').html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');
	var oTable = $('#example').dataTable( {
		"bJQueryUI": true,
		"sPaginationType": "full_numbers",
		"aaData": aDataSet,
		"aoColumns": [
			{ "sTitle": "设备ID" },
			{ "sTitle": "浏览器" },
			{ "sTitle": "操作系统" },
			{ "sTitle": "移动设备", "sClass": "center" },
			{ "sTitle": "账户", "sClass": "center" }
		]
	});	
	$('#example tr').click( function() {
		$(this).toggleClass('row_selected');
		if ($(this).hasClass('row_selected')) {
			var device = this.cells.item(0).innerText;
			var list = add_device(device);
			console.log(list);
		} else {
			var device = this.cells.item(0).innerText;
			var list = remove_device(device);
			console.log(list);
		}
	});


	var theme = '';
	var source = ['通知','紧急通知','会议通知'];
	$("#notify-title").jqxComboBox({theme: theme,source: source, selectedIndex:0, width:90, height:28});

	var countries = new Array();
	$("#notify-content").jqxInput({theme: theme,placeHolder:"请输入通知内容",source:countries,width:506,height:28});
	$("#property-panel").jqxPanel({theme: theme, width: 283, height: 28, theme: theme });

	$("#notify-ttl").jqxNumberInput({theme: theme,symbol:'秒',symbolPosition:'right',min:1,decimal:8,decimalDigits:0,width:55,height:26, inputMode:'simple',spinButtons:true});
	$("#notify-ttl").jqxTooltip({theme: theme, content: '通知延迟关闭时间', position: 'mouse'});

	var source = ['自动消退','固定显示'];
	$("#issticky").jqxDropDownList({source:source, selectedIndex:0,width: '78', height: '26', theme: theme });

	var source = ['没有警示','强制警示'];
	$("#iswarnning").jqxDropDownList({source:source, selectedIndex:0,width: '78', height: '26', theme: theme });

	var source_posi = ['左上方','左下方','右上方','右下方'];
	$("#viewposi").jqxDropDownList({source:source_posi, selectedIndex:2,width: '64', height: '26', theme: theme });

	$("#send-button").jqxButton({ width: 75, height:30, theme: theme });
	$("#send-button").on('click', function () {
		var title = $('#notify-title').jqxComboBox('val');
		var content = $('#notify-content').val();
		var issticky = $("#issticky").jqxDropDownList('getSelectedIndex'); 
		var iswarnning = $("#iswarnning").jqxDropDownList('getSelectedIndex'); 
		var viewposi = $("#viewposi").jqxDropDownList('getSelectedIndex'); 
		var ttl = $('#notify-ttl').jqxNumberInput('getDecimal');

		var source_posi = ['top-left','bottom-left','top-right','bottom-right'];
		var source_bool = [false,true];
		var device_id = document.cookie.match(new RegExp("(^| )device_id=([^;]*)(;|$)"));
		device_id = device_id? device_id[2] : 'null';
		var target_devices = JSON.stringify(get_device());

		var cmdbox = new Object();
		cmdbox.title = title;
		cmdbox.text = content;
		cmdbox.sticky = source_bool[issticky];
		cmdbox.before_open = source_bool[iswarnning];
		cmdbox.time = 	ttl*1000;
		cmdbox.position = source_posi[viewposi];
		
		$.post("api.php", {
				cmd: 	'sendmessage',
				target: escape(target_devices),
				cmdbox: escape(JSON.stringify(cmdbox)),
			}, function(data,status) {
				console.log(status + ': ' +  data);

			}
		);});
	$("input[name='notify-ttl']").css("cssText", "height: 26px !important;");
	$("table#example").css("cssText", "font-size:13px !important;");
	$('#example_wrapper').css('cssText', "font-size:13px !important;");
    });

</script>
</head>
<body background="images/bg_tile.jpg">
	<div id='content' style='min-width: 600px; max-width: 960px; margin: auto;'>
		<div id='message'>
			<div id="notify-title" style='float:left;'></div>
			<input id="notify-content" type="text" style='float:left;'/>
			<input id='send-button' type="button" value="发送消息" style='float:left;' />
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
