function api_ui_init(aDataSet)
{
    $(document).ready(function() {
	$('#dynamic').html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');
	var oTable = $('#example').dataTable( {
		"bJQueryUI": true,
		"sPaginationType": "full_numbers",
		"aaData": aDataSet,
		"bAutoWidth": false,
		"aoColumns": [
			{ 'sTitle': '在线账户', 'sWidth': '320px'},
			{ 'sTitle': '访问来源', 'sWidth': '100px'},
			{ 'sTitle': '正在访问', 'sWidth': '150px'},
			{ 'sTitle': '浏览器',   'sWidth': '90px', 'sClass': 'center'},
			{ 'sTitle': '操作系统', 'sWidth': '90px', 'sClass': 'center'},
			{ 'sTitle': '移动', 	'sWidth': '50px', 'sClass': 'center'},
			{ 'sTitle': '设备ID',   'bVisible': false},
		]
	});	
	$('#example tr').click( function() {
		$(this).toggleClass('row_selected');
		var sData = oTable.fnGetData(this);

		if ($(this).hasClass('row_selected')) {
			var list = add_device(sData[6]);
			console.log(list);
		} else {
			var list = remove_device(sData[6]);
			console.log(list);
		}
	});


	var theme = '';
	var source = ['通知','活动通知','抽奖活动','紧急通知','会议通知'];
	$("#notify-title").jqxComboBox({theme: theme,source: source, selectedIndex:0, width:80, height:28});

	var countries = new Array();
	$("#notify-content").jqxInput({theme: theme,placeHolder:"请输入通知内容",source:countries,width:394,height:28});
	$("#property-panel").jqxPanel({theme: theme, width: 277, height: 28, theme: theme });

	$("#notify-ttl").jqxNumberInput({theme: theme,symbol:'秒',symbolPosition:'right',min:1,decimal:8,decimalDigits:0,width:55,height:26, inputMode:'simple',spinButtons:true});
	$("#notify-ttl").jqxTooltip({theme: theme, content: '通知延迟关闭时间', position: 'mouse'});

	var source = ['自动消退','固定显示'];
	$("#issticky").jqxDropDownList({source:source, selectedIndex:0,width: '76', height: '26', theme: theme });

	var source = ['没有警示','强制警示'];
	$("#iswarnning").jqxDropDownList({source:source, selectedIndex:0,width: '76', height: '26', theme: theme });

	var source_posi = ['左上方','左下方','右上方','右下方'];
	$("#viewposi").jqxDropDownList({source:source_posi, selectedIndex:2,width: '62', height: '26', theme: theme });

	$("#send-button").jqxButton({ width: 43, height:30, theme: theme });
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
}

function add_device(device) 
{
	device_list = window.devices;
	if (device_list == null) {
		device_list = new Array();
		window.devices = device_list;
	}

	if (device_list.indexOf(device) == -1) {
		device_list.push(device);
	}
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
