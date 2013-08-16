<?php
require_once 'functions.php';
require_once 'functions/auth.php';

AUTH_ENABLE && force_login();

header('Content-Type: text/html; charset=utf-8');

/*
ini_set("log_errors", 1);
ini_set("error_log", "/var/log/php_errors.log");
*/

function get_online_objects()
{
	$device_browser_list = mmc_array_values(NS_DEVICE_LIST);
	time_print('性能分析：取列表：');

	if (isset($_GET['debug'])) {
		$device_count = mmc_array_length(NS_DEVICE_LIST);

		$memcache_obj = new Memcache; 
		$memcache_obj->connect(MEMC_HOST, MEMC_PORT); 
		$stats = $memcache_obj->getStats();
		$memcache_obj->close();

		$dbg_print = '开始时间：'.getDateStyle($stats['time']-$stats['uptime']);
		$dbg_print .= ' 使用内存: '.bytesToSize($stats['bytes']).'/'.bytesToSize($stats['limit_maxbytes']);
		$dbg_print .= '<br>清理时间：'.getDateStyle(async_timer('/on_timer_online_list.php'));
		$dbg_print .= ' 维护设备数: '.$device_count.'  活跃设备数: '.count($device_browser_list);

		$xmlStr = file_get_contents('http://'.$_SERVER['SERVER_NAME'].'/channels-stats');
		$channels = json_decode($xmlStr);

		$dbg_print .= '<br>推送开始：'.getDateStyle(time() - $channels->uptime).' 频道数: '.$channels->channels;
		$dbg_print .= ' 订阅数: '.$channels->subscribers.' 消息数: '.$channels->published_messages;
		$dbg_print .= '<br>流程计数： '.counter().'<br>';
		echo $dbg_print;
	}

	/******************************************************
	预处理：账户绑定列表
	******************************************************/

	$aDataSet = [];
	foreach($device_browser_list as $browser) 
	{
		if (empty($browser)) {
			continue;
		}

		$account_json = @$browser['bind_account'];
		if (empty($account_json)) {
			$account = '';
		} else {
			$account_arr = json_decode($account_json, true);
			$account = implode(';', $account_arr);
		}

		$device = $browser['device'];
		$useragent = $browser['UserAgent'];

		$ref_obj = ($browser['Visiting'])? parse_url($browser['Visiting']) : null;
		$visiting = @$ref_obj['host'];
		$is_mobile = ($browser['ismobiledevice'])? 'mobi' : 'desk';

		$aDataSet[] = [$account,$browser['region'],$visiting,$browser['browser'],$browser['platform'],
				$is_mobile,$browser['device_name'],$browser['device']];
	}

	time_print('整合：');
	if (isset($_GET['debug'])) {
		echo time_print();
	}

	return $aDataSet;
}

$aDataSet = get_online_objects();


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

<script type="text/javascript" language="javascript" src="js/omp_ui.js"></script>
<script type="text/javascript" language="javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="jqwidgets/jqx-all.js"></script> 

<script type="text/javascript" src="jqwidgets/globalization/globalize.js"></script>
<script type="text/javascript" src="jqwidgets/globalization/globalize.culture.zh-CN.js"></script> 

<script type="text/javascript" language="javascript" src="datatables/jquery.dataTables.min.js"></script>
<script type="text/javascript" language="javascript" src="datatables/TableTools.js"></script>
<script type="text/javascript" language="javascript" src="datatables/ZeroClipboard.js"></script>
<script type="text/javascript" charset="utf-8">
var aDataSet = <?php echo json_encode($aDataSet); ?>;
var nTotalItem = <?php echo count($aDataSet); ?>;
api_ui_init(aDataSet);


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
	input.jqx-input-content {
		height: auto !important;
	}
	.jqx-window-modal {
		height: auto !important;
	}
	.jqx-popup {
		z-index: 20000 !important;
	}
	.jqx-tabs-title {
		padding-left: 5px !important;
		padding-right: 5px !important;
	}

</style>
</head>
<body background="images/bg_tile.jpg">
	<div id='content'>
		<div id='jqxTabs'>
			<ul>
				<li style="margin-left: 30px;">
					<img style='float: left;' width='16' height='16' src="/images/calendarIcon.png" alt="" class="small-image" />
					<div style="float: left;">弹窗任务管理</div>
				</li>
				<li>
					<img style='float: left;' width='16' height='16' src="/images/calendarIcon.png" alt="" class="small-image" />
					<div style="float: left;">替换任务管理</div>
				</li>

				<li style="margin-left: 50px;">
					<img style='float: left;' width='16' height='16' src="/images/people.png" alt="" class="small-image" />
					<div style="float: left;">终端分类库</div>
				</li>

				<li>
					<img style='float: left;' width='16' height='16' src="/images/message.png" alt="" class="small-image" />
					<div style="float: left;">预设消息库</div>
				</li>

				<li>
					<img style='float: left;' width='16' height='16' src="/images/message.png" alt="" class="small-image" />
					<div style="float: left;">替换位置库</div>
				</li>
				<li style="margin-left: 50px;">
					<img style='float: left;' width='16' height='16' src="/images/chart.png" alt="" class="small-image" />
					<div style="float: left;">详细报表</div>
				</li>
				<li>
					<img style='float: left;' width='16' height='16' src="/images/mailIcon.png" alt="" class="small-image" />
					<div style="float: left;">发送即时信息</div>
				</li>
				<li >
					<img style='float: left;' width='16' height='16' src="/images/settings.png" alt="" class="small-image" />
					<div style="float: left;">系统配置</div>
				</li>
			</ul>
		
			<div id='tab_sched'></div><!-- 发送任务管理 标签 -->
			<div id='tab_replace'></div> <!-- 替换任务管理 标签 -->
			<div id='tab_user'></div><!-- 终端分类库 标签 -->
			<div id='tab_message'></div><!-- 预存消息库 标签 -->
			<div id='tab_posi'></div> <!-- 替换位置库 标签 -->

			<!-- 报表 标签 -->
			<div style='height:380px;'>
			</div>

			<!-- 发送即时消息 标签 -->
			<div> 
				<div id='message'>
					<div id="notify-title" style='float:left;'></div>
					<input id="notify-content" type="text" style='float:left;'/>
					<div id='property-panel' style='float:right;'>
						<input id='send-button' type="button" value="发送到" style='float:left;' />
						<div id='viewposi' style='float: left;'></div>
						<div id='message-form' style='float: left;'></div>
						<div id='message-mode' style='float: left;'></div>
						<div id='notify-ttl' style='float:left;'></div>
						<div id='issticky' style='float: left;'></div>
						<div id='iswarnning' style='float: left;'></div>
					</div>
				</div>
				<div id='dynamic'></div>
			</div>

			<!-- 系统配置 标签 -->
			<div style='height:380px;'>
			</div>
		</div>

	</div>
</body>
</html>

