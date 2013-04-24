<?php
require_once 'memcache_array.php';
require_once 'config.php';

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
$referer = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($referer ? ($referer['scheme'].'://'.$referer['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if (isset($_GET['cmd']) or isset($_POST['cmd'])) goto label_api_mode;

$aDataSet = [
	['Trident1','Internet Explorer 4.0','Win 95+','4','X'],
	['Trident2','Internet Explorer 4.0','Win 95+','4','X'],
	['Trident3','Internet Explorer 4.0','Win 95+','4','X'],
	['Trident4','Internet Explorer 5.0','Win 95+','5','C'],
	['Trident5','Internet Explorer 5.0','Win 95+','5','C'],
	['Trident6','Internet Explorer 5.0','Win 95+','5','C'],
	['Trident7','Internet Explorer 5.5','Win 95+','5.5','A']
];

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
	<script type="text/javascript" language="javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" language="javascript" src="js/jquery.dataTables.js"></script>
	<script type="text/javascript" charset="utf-8">
		/* Data set - can contain whatever information you want */
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
					console.log('do: '+this.cells.item(0).innerText);
				} else {
					console.log('undo: '+this.cells.item(0).innerText);
				}
			});
		} );
	</script>
</head>
<body>
	<div id="dynamic" style="min-width: 640; max-width: 1024px;"></div>
</body>
</html>

<?php
exit();

label_api_mode:
# 获取设备id和分类和发送
# get http://omp.cn/api.php?cmd=list&type=[device|browser|platform|mobile]
# post http://omp.cn/api.php?cmd=send&type=[device|browser|platform|mobile]&value=xxxxx

# 获取业务身份和发送
# get http://omp.cn/api.php?cmd=listplats
# get http://omp.cn/api.php?cmd=listrole&plat=tencent_qq
# post http://omp.cn/api.php?cmd=sendrole&plat=tencent_qq&username=xxxx&nickname=xxxx



?>
