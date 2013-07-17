<?php
require_once 'functions.php';
require_once 'functions/auth.php';

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
	$dbg_print .= '清理时间：'.getDateStyle(async_timer('/on_timer_online_list.php'));
	$dbg_print .= ' 维护设备数: '.$device_count.'  活跃设备数: '.count($device_browser_list);
	$dbg_print .= '  绑定账户数: '.$binding_count.'<br>';

	$xmlStr = file_get_contents('http://'.$_SERVER['SERVER_NAME'].'/channels-stats');
	$channels = json_decode($xmlStr);

	$dbg_print .= '推送开始：'.getDateStyle(time() - $channels->uptime).' 频道数: '.$channels->channels;
	$dbg_print .= ' 订阅数: '.$channels->subscribers.' 消息数: '.$channels->published_messages.'<br>';
	$dbg_print .= '流程计数： '.counter().'<br>';
	echo $dbg_print;
}


/******************************************************
预处理：账户绑定列表
******************************************************/

$account_list = [];
foreach($device_platform_list as $platform) {
	$ns_binding = NS_BINDING_LIST.$platform;
	$account_list[mmc_array_caption($ns_binding)] = mmc_array_gets($ns_binding, $device_online_list);
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
	$account = get_binding_name($device);

	$ref_obj = ($browser['visiting'])? parse_url($browser['visiting']) : null;
	$visiting = $ref_obj['host'];
	$is_mobile = ($browser['ismobiledevice'])? 'mobi' : 'desk';

	$aDataSet[] = [$account,$browser['region'],$visiting,$browser['browser'],$browser['platform'],
			$is_mobile,$browser['device_name'],$browser['device']];
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
					<div style="float: left;">发送任务管理</div>
				</li>

				<li>
					<img style='float: left;' width='16' height='16' src="/images/people.png" alt="" class="small-image" />
					<div style="float: left;">终端分类库</div>
				</li>

				<li>
					<img style='float: left;' width='16' height='16' src="/images/message.png" alt="" class="small-image" />
					<div style="float: left;">预设消息库</div>
				</li>
				<li>
					<img style='float: left;' width='16' height='16' src="/images/chart.png" alt="" class="small-image" />
					<div style="float: left;">详细报表</div>
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

			<div> <!-- tab标签 -->
				<div style="margin-right: 5px; float: right;">
					<input id="addrowbutton_sched" type="button" value="添加" />
					<input id="updaterowbutton_sched" type="button" value="修改" />
					<input id="deleterowbutton_sched" type="button" value="删除" />
				</div>
				<div id='jqxgrid_sched_list'></div>

				<div id="popupWindow_sched">
					<div>编辑发送任务</div>
					<div style="overflow: hidden;">
					<table>
					<tr>
						<td align="right">任务名称：</td>
						<td align="left"><input id="sched_name" /></td>
					</tr>
					<tr>
						<td align="right">发送人群：</td>
						<td align="left">
							<div id="sched_target">
								<div style="border: none;" id="sched_target_grid"></div>
							</div>
						</td>
					</tr>
					<tr>
						<td align="right">发送消息：</td>
						<td align="left">
							<div id="sched_message">
								<div style="border: none;" id="sched_message_grid"></div>
							</div>
						</td>
					</tr>
					<tr>
						<td align="right">运行状态：</td>
						<td align="left"><div id="sched_status" /></td>
					</tr>
					<tr>
						<td align="right">开始时间：</td>
						<td align="left"><div id="sched_start" /></td>
					</tr>
					<tr>
						<td align="right">结束时间：</td>
						<td align="left"><div id="sched_end" /></td>
					</tr>
					<tr>
						<td align="right">执行次数：</td>
						<td align="left"><div id="sched_times"></textarea></td>
					</tr>
					<tr>
						<td align="right">每次间隔：</td>
						<td align="left"><div id="sched_interval"></div></td>
					</tr>
					<tr>
						<td align="right">间隔模式：</td>
						<td align="left"><div id="sched_interval_mode"></div></td>
					</tr>
					<tr>
						<td align="right">消息顺序：</td>
						<td align="left"><div id="sched_sequence"></div></td>
					</tr>
					<tr>
						<td align="right">任务互斥：</td>
						<td align="left"><div id="sched_repel"></div></td>
					</tr>
					<tr>
						<td align="right"></td>
						<td style="padding-top: 10px;" align="right">
							<input id="Save_sched" style="margin-right: 5px;" type="button" value="保存" />
							<input id="Cancel_sched" type="button" value="取消" /></td>
					</tr>
					</table>
					</div>
				</div>
			</div> <!-- tab标签 -->

			<div> <!-- tab标签 -->
				<div style="margin-right: 5px; float: right;">
					<input id="addrowbutton_user" type="button" value="添加" />
					<input id="updaterowbutton_user" type="button" value="修改" />
					<input id="deleterowbutton_user" type="button" value="删除" />
				</div>
				<div id='jqxgrid_user_list'></div>

				<div id="popupWindow_user">
					<div>编辑终端设备分类规则</div>
					<div style="overflow: hidden;">
					<table>
					<tr>
						<td align="right">规则名称：</td>
						<td align="left"><input id="usr_name" /></td>
					</tr>
					<tr>
						<td align="right">分类标签：</td>
						<td align="left"><input id="usr_tags" /></td>
					</tr>
					<tr>
						<td align="right">新用户：</td>
						<td align="left"><div id="usr_newuser" /></td>
					</tr>
					<tr>
						<td align="right">新来访：</td>
						<td align="left"><div id="usr_visitor"></textarea></td>
					</tr>
					<tr>
						<td align="right">移动应用：</td>
						<td align="left"><div id="usr_mobile"></div></td>
					</tr>
					<tr>
						<td align="right">已注册：</td>
						<td align="left"><div id="usr_binded"></div></td>
					</tr>
					<tr>
						<td align="right">浏览器：</td>
						<td align="left"><input id="usr_browser"></div></td>
					</tr>
					<tr>
						<td align="right">操作系统：</td>
						<td align="left"><input id="usr_platform"></div></td>
					</tr>
					<tr>
						<td align="right">设备名：</td>
						<td align="left"><input id="usr_device"></div></td>
					</tr>
					<tr>
						<td align="right">地区：</td>
						<td align="left"><input id="usr_region"></div></td>
					</tr>
					<tr>
						<td align="right">账户名：</td>
						<td align="left"><input id="usr_account"></div></td>
					</tr>
					<tr>
						<td align="right">浏览器特征：</td>
						<td align="left"><input id="usr_useragent"></div></td>
					</tr>
					<tr>
						<td align="right">访问网址：</td>
						<td align="left"><input id="usr_visiting"></div></td>
					</tr>
					<tr>
						<td align="right"></td>
						<td style="padding-top: 10px;" align="right">
							<input id="Save_user" style="margin-right: 5px;" type="button" value="保存" />
							<input id="Cancel_user" type="button" value="取消" /></td>
					</tr>
					</table>
					</div>
				</div>

			</div> <!-- tab标签 -->

			<div> <!-- tab标签 -->
				<div style="margin-right: 5px; float: right;">
					<input id="addrowbutton" type="button" value="添加" />
					<input id="updaterowbutton" type="button" value="修改" />
					<input id="deleterowbutton" type="button" value="删除" />
				</div>
				<div id='jqxgrid_msg_list'></div>

				<div id="popupWindow_msg">
					<div>编辑消息</div>
					<div style="overflow: hidden;">
					<table>
					<tr>
						<td align="right">消息名称：</td>
						<td align="left"><input id="msg_name" /></td>
					</tr>
					<tr>
						<td align="right">分类标签：</td>
						<td align="left"><input id="msg_tags" /></td>
					</tr>
					<tr>
						<td align="right">消息标题：</td>
						<td align="left"><div id="msg_title" /></td>
					</tr>
					<tr>
						<td align="right">消息内容：</td>
						<td align="left"><textarea id="msg_content"></textarea></td>
					</tr>
					<tr>
						<td align="right">消息类型：</td>
						<td align="left"><div id="msg_msgmode"></div></td>
					</tr>
					<tr>
						<td align="right">显示位置：</td>
						<td align="left"><div id="msg_position"></div></td>
					</tr>
					<tr>
						<td align="right">固定显示：</td>
						<td align="left"><div id="msg_sticky"></div></td>
					</tr>
					<tr>
						<td align="right">显示时长：</td>
						<td align="left"><div id="msg_time"></div></td>
					</tr>
					<tr>
						<td align="right">弹窗警示：</td>
						<td align="left"><div id="msg_before_open"></div></td>
					</tr>
					<tr>
						<td align="right"></td>
						<td style="padding-top: 10px;" align="right">
							<input id="Save_msg" style="margin-right: 5px;" type="button" value="保存" />
							<input id="Cancel_msg" type="button" value="取消" /></td>
					</tr>
					</table>
					</div>
				</div>

			</div>

			<div style='height:380px;'>
			</div>

			<div style='height:380px;'>
			</div>
		</div>

	</div>
</body>
</html>

