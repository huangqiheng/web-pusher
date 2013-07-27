function api_ui_init(aDataSet)
{
	//预存消息管理
	var source_posi = ['top-left','bottom-left','top-right','bottom-right'];
	var source_posi_cn = ['左上方','左下方','右上方','右下方'];
	var source_msgmod = ['realtime', 'heartbeat'];
	var source_msgmod_cn = ['实时消息','异步消息'];
	var source_sticky = ['false','true'];
	var source_sticky_cn = ['自动消退','固定显示'];
	var source_warning = ['false','true'];
	var source_warning_cn = ['没有警示','强制警示'];
	var source_notify_title = ['通知','活动通知','抽奖活动','紧急通知','会议通知'];

	//发送任务管理
	var source_sched_status = ['start', 'stop', 'waiting', 'running', 'timeout'];
	var source_sched_status_cn = ['开始', '停止', '待命','运行', '过时'];
	var source_sched_inval    = [60+'', 60*3+'', 60*5+'', 60*10+'', 60*15+'', 60*30+'', 
		3600+'', 3600+1800+'', 3600*2+'', 3600*3+'', 3600*4+'', 3600*5+'', 3600*6+'', 3600*8+'', 3600*10+'', 3600*12+'', 3600*16+'', 
		3600*24*1+'', 3600*24*2+'', 3600*24*3+'', 3600*24*4+'', 3600*24*5+'', 3600*24*6+'', 3600*24*7+'', 
		3600*24*10+'', 3600*24*14+'', 3600*24*20+'', 3600*24*21+'', 3600*24*28+'', 3600*24*30+''];
	var source_sched_inval_cn = ['1分钟', '3分钟', '5分钟', '10分钟', '15分钟', '30分钟', 
		'1小时', '1.5小时','2小时', '3小时', '4小时', '5小时', '6小时', '8小时', '10小时', '12小时', '16小时', 
		'1天', '2天', '3天', '4天', '5天', '6天', '7天', 
		'10天', '14天', '20天', '21天', '28天', '30天'];
	var source_schedmode = ['absolute', 'relative'];
	var source_schedmode_cn = ['绝对间隔', '相对间隔'];
	var source_sequence = ['sequence', 'random', 'confusion'];
	var source_sequence_cn = ['顺序消息', '随机消息', '乱序消息'];
	var source_repel = ['false', 'true'];
	var source_repel_cn = ['同屏显示', '单独显示'];


	//目标管理
	var source_null = '--';
	var source_bool = ['null', 'true', 'false'];
	var source_newuser = source_bool;
	var source_newuser_cn = [source_null, '首次访问', '后续访问'];
	var source_newvisitor = source_bool;
	var source_newvisitor_cn = [source_null, '再次到访', '后续访问'];
	var source_mobile = source_bool;
	var source_mobile_cn = [source_null, '移动设备', '其他设备'];
	var source_binded = source_bool;
	var source_binded_cn = [source_null, '已注册', '未注册'];

	function trans(value, from, to) {
		return to[from.indexOf(value)]; 
	}

	function cn2en(d) {
		if (d.hasOwnProperty('name')) {
			(d.hasOwnProperty('msgmod')) && (d.msgmod = trans(d.msgmod, source_msgmod_cn, source_msgmod));
			(d.hasOwnProperty('position')) && (d.position=trans(d.position, source_posi_cn, source_posi));
			(d.hasOwnProperty('sticky')) && (d.sticky=trans(d.sticky, source_sticky_cn, source_sticky));
			(d.hasOwnProperty('before_open')) && (d.before_open=trans(d.before_open, source_warning_cn, source_warning));
			(d.hasOwnProperty('new_user')) && (d.new_user=trans(d.new_user, source_newuser_cn, source_newuser));
			(d.hasOwnProperty('new_visitor')) && (d.new_visitor=trans(d.new_visitor, source_newvisitor_cn, source_newvisitor));
			(d.hasOwnProperty('ismobiledevice')) && (d.ismobiledevice=trans(d.ismobiledevice, source_mobile_cn, source_mobile));
			(d.hasOwnProperty('binded')) && (d.binded=trans(d.binded, source_binded_cn, source_binded));

			(d.hasOwnProperty('time_interval')) && (d.time_interval=trans(d.time_interval, source_sched_inval_cn, source_sched_inval));
			(d.hasOwnProperty('time_interval_mode')) && (d.time_interval_mode=trans(d.time_interval_mode, source_schedmode_cn, source_schedmode));
			(d.hasOwnProperty('msg_sequence')) && (d.msg_sequence=trans(d.msg_sequence, source_sequence_cn, source_sequence));
			(d.hasOwnProperty('repel')) && (d.repel=trans(d.repel, source_repel_cn, source_repel));
		} else {
			$(d).each(function() {
				cn2en(this);
			});
		}
		return d;
	}

	function en2cn(d) {
		if (d.hasOwnProperty('name')) {
			(d.hasOwnProperty('msgmod')) && (d.msgmod = trans(d.msgmod, source_msgmod, source_msgmod_cn));
			(d.hasOwnProperty('position')) && (d.position=trans(d.position, source_posi, source_posi_cn));
			(d.hasOwnProperty('sticky')) && (d.sticky=trans(d.sticky, source_sticky, source_sticky_cn));
			(d.hasOwnProperty('before_open')) && (d.before_open=trans(d.before_open, source_warning, source_warning_cn));
			(d.hasOwnProperty('new_user')) && (d.new_user=trans(d.new_user, source_newuser, source_newuser_cn));
			(d.hasOwnProperty('new_visitor')) && (d.new_visitor=trans(d.new_visitor, source_newvisitor, source_newvisitor_cn));
			(d.hasOwnProperty('ismobiledevice')) && (d.ismobiledevice=trans(d.ismobiledevice, source_mobile, source_mobile_cn));
			(d.hasOwnProperty('binded')) && (d.binded=trans(d.binded, source_binded, source_binded_cn));

			(d.hasOwnProperty('time_interval')) && (d.time_interval=trans(d.time_interval, source_sched_inval, source_sched_inval_cn));
			(d.hasOwnProperty('time_interval_mode')) && (d.time_interval_mode=trans(d.time_interval_mode, source_schedmode, source_schedmode_cn));
			(d.hasOwnProperty('msg_sequence')) && (d.msg_sequence=trans(d.msg_sequence, source_sequence, source_sequence_cn));
			(d.hasOwnProperty('repel')) && (d.repel=trans(d.repel, source_repel, source_repel_cn));
		} else {
			$(d).each(function() {
				en2cn(this);
			});
		}
		return d;
	}

	function handle_list_remote(url, rowdata, commit) {
		var new_rowdata = $.extend({}, rowdata);
		jQuery.ajax({
			type: 'POST',
			url: url,
			beforeSend: function(xhrObj){
				xhrObj.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
				xhrObj.setRequestHeader("Accept","application/json");
			},
			dataType:'text', 
			data: cn2en(new_rowdata),
			success: function(msg) {
				console.log(msg);
				commit(true);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log(errorThrown);
				commit(false);
			}
		});
	}

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

		var device_id = document.cookie.match(new RegExp("(^| )device_id=([^;]*)(;|$)"));
		device_id = device_id? device_id[2] : 'null';

		var cmdbox = new Object();
		cmdbox.name = 'manual send message';
		cmdbox.title = title;
		cmdbox.text = content;
		cmdbox.sticky = source_sticky[issticky];
		cmdbox.before_open = source_warning[iswarnning];
		cmdbox.msgmod = source_msgmod[msgmod];
		cmdbox.time = 	ttl*1000;
		cmdbox.position = source_posi[viewposi];

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

		$("#notify-title").jqxComboBox({theme: theme,source: source_notify_title, selectedIndex:0, width:80, height:28});

		var countries = new Array();
		$("#notify-content").jqxInput({theme: theme,placeHolder:"请输入通知内容",source:countries,width:443,height:28});
		$("#send-button").jqxButton({ width: 76, height:30, theme: theme });

		$("#send-button").on('click', send_omp_message);

		$("#property-panel").jqxPanel({theme: theme, height: 30, width:431, theme: theme });

		$("#message-mode").jqxDropDownList({source:source_msgmod_cn, selectedIndex:1,width: 76, height: 28, theme: theme });

		$("#notify-ttl").jqxNumberInput({theme: theme,symbol:'秒',symbolPosition:'right',min:1,decimal:8,decimalDigits:0,width:55,height:28, inputMode:'simple',spinButtons:true});
		$("#notify-ttl").jqxTooltip({theme: theme, content: '通知延迟关闭时间', position: 'mouse'});

		$("#issticky").jqxDropDownList({source:source_sticky_cn, selectedIndex:0,width: 76, height: 28, theme: theme });

		$("#iswarnning").jqxDropDownList({source:source_warning_cn, selectedIndex:0,width: 76, height: 28, theme: theme });

		$("#viewposi").jqxDropDownList({source:source_posi_cn, selectedIndex:2,width: 62, height: 28, theme: theme });

		$('#jqxTabs').jqxTabs({
			width:958,
			position:'top',
			theme:theme,
			//animationType: 'fade',
			contentTransitionDuration: 500,
			scrollable:false,
			selectedItem: 1,
			});


		/**********************************
		终端分类库UI代码
		**********************************/
/*
//终端设备分类
//布尔值 true/false/null
$item['new_user']
$item['new_visitor']
$item['ismobiledevice']
$item['binded']
//字符串匹配
$item['browser']
$item['platform']
$item['device_name']
$item['region']
$item['bind_account']
/正则表达式
$item['UserAgent']
$item['Visiting']

//消息列表
$item['sched_msg']

//发送管理
$item['finish_time']
$item['start_time']
$item['times']
$item['time_last']
$item['time_interval']
$item['repel']
*/
		var sched_lst_data = {
			data_fields : [
				{name: 'name', type: 'string'},
				{name: 'status', type: 'string'},
				{name: 'start_time', type: 'date'},
				{name: 'finish_time', type: 'date'},
				{name: 'times', type: 'string'},
				{name: 'time_interval', type: 'string'},
				{name: 'time_interval_pre', type: 'string'},
				{name: 'time_interval_mode', type: 'string'},
				{name: 'msg_sequence', type: 'string'},
				{name: 'repel', type: 'string'},
				{name: 'target_device', type: 'string'},
				{name: 'sched_msg', type: 'string'}
			],
			data_columns : [
				{text: '任务名称', datafield: 'name', width: 78},
				{text: '状态', datafield: 'status', width: 32},
				{text: '开始时间', datafield: 'start_time', width: 190},
				{text: '结束时间', datafield: 'finish_time', width: 190},
				{text: '次数', datafield: 'times', width: 40},
				{text: '每次', datafield: 'time_interval', width: 32},
				{text: '前距', datafield: 'time_interval_pre', width: 32},
				{text: '模式', datafield: 'time_interval_mode', width: 32},
				{text: '顺序', datafield: 'msg_sequence', width: 32},
				{text: '互斥', datafield: 'repel', width: 32},
				{text: '发送目标', datafield: 'target_device', width: 133},
				{text: '发送消息', datafield: 'sched_msg', width: 133}
			],
			create_form: function(){
				var base_opt = {theme: theme, width: 400, height: this.elemHeight};
				var drop_opt = {theme: theme, width: 100, height: this.elemHeight};
				var numb_base = $.extend({inputMode: 'simple', decimalDigits:0,  spinButtons: true,symbolPosition: 'right'}, drop_opt);
				var numb_opt  = $.extend({symbol:'次', decimal:8},  numb_base);
				var numb_opt2 = $.extend({symbol:'秒', decimal:30}, numb_base);
				var date_opt = {culture:'zh-CN', formatString: 'F', theme:theme, width:200, height:this.elemHeight};
				$("#sched_status").jqxDropDownList($.extend({source:source_sched_status_cn, selectedIndex:0}, drop_opt));
				$("#sched_start").jqxDateTimeInput(date_opt);
				$("#sched_end").jqxDateTimeInput(date_opt);
				$("#sched_times").jqxNumberInput(numb_opt);
				$("#sched_interval").jqxDropDownList($.extend({source:source_sched_inval_cn, selectedIndex:2}, drop_opt));
				$("#sched_interval_pre").jqxNumberInput(numb_opt2);
				$("#sched_interval_mode").jqxDropDownList($.extend({source:source_schedmode_cn, selectedIndex:0}, drop_opt));
				$("#sched_sequence").jqxDropDownList($.extend({source:source_sequence_cn, selectedIndex:0}, drop_opt));
				$("#sched_repel").jqxDropDownList($.extend({source:source_repel_cn, selectedIndex:0}, drop_opt));
				$("#sched_target").jqxDropDownButton(base_opt);
				$("#sched_message").jqxDropDownButton(base_opt);
			},
			fill_form : function(data_record) {
				if (data_record.hasOwnProperty('status')) {
					$("#sched_status").jqxDropDownList({selectedIndex: source_sched_status_cn.indexOf(data_record.status)}); 
				}
				if (data_record.hasOwnProperty('start_time')) {
					$('#sched_start').jqxDateTimeInput('setDate', data_record.start_time);
				}
				if (data_record.hasOwnProperty('finish_time')) {
					$('#sched_end').jqxDateTimeInput('setDate', data_record.finish_time);
				}
				if (data_record.hasOwnProperty('times')) {
					$('#sched_times').jqxNumberInput('setDecimal', data_record.times);
				}
				if (data_record.hasOwnProperty('time_interval')) {
					$("#sched_interval").jqxDropDownList({selectedIndex: source_sched_inval_cn.indexOf(data_record.time_interval)}); 
				}
				if (data_record.hasOwnProperty('time_interval_pre')) {
					$('#sched_interval_pre').jqxNumberInput('setDecimal', data_record.time_interval_pre);
				}
				if (data_record.hasOwnProperty('time_interval_mode')) {
					$("#sched_interval_mode").jqxDropDownList({selectedIndex: source_schedmode_cn.indexOf(data_record.time_interval_mode)}); 
				}
				if (data_record.hasOwnProperty('msg_sequence')) {
					$("#sched_sequence").jqxDropDownList({selectedIndex: source_sequence_cn.indexOf(data_record.msg_sequence)}); 
				}
				if (data_record.hasOwnProperty('repel')) {
					$("#sched_repel").jqxDropDownList({selectedIndex: source_repel_cn.indexOf(data_record.repel)}); 
				}

				var get_nametags = function(g) {
					var a = $(g).jqxGrid('getrows');
					var tags = Array();
					var names = Array();
					$.each(a, function(index, value){
						var lines = value.tags.split(' ');
						$.each(lines, function(index, value2) {
							if (value2) {
								if (tags.indexOf(value2) === -1) {
									tags.push(value2);
								}
							}
						});
						if (names.indexOf(value.name) === -1) {
							names.push(value.name);
						}
					});
					tags = $.map(tags, function(item){return '['+item+']';});
					return Array(names, tags);
				};

				var make_array_data = function(items) {
					var data = Array();
					while (items.length > 0) {
						var line = {};
						line['1'] = items.shift();
						line['2'] = items.shift();
						line['3'] = items.shift();
						line['4'] = items.shift();
						line['5'] = items.shift();
						line['6'] = items.shift();
						line['7'] = items.shift();
						line['8'] = items.shift();
						data.push(line);
					};
					return data;
				};

				var get_source = function(items) {
					var source =
					{
						localdata: make_array_data(items),
						datafields:
						[
							{name: '1', type: 'string'},
							{name: '2', type: 'string'},
							{name: '3', type: 'string'},
							{name: '4', type: 'string'},
							{name: '5', type: 'string'},
							{name: '6', type: 'string'},
							{name: '7', type: 'string'},
							{name: '8', type: 'string'}
						],
						datatype: "array"
					};
					var data_adapt = new $.jqx.dataAdapter(source);
					data_adapt.source_ori = source;
					return data_adapt;
				};

				var pop_opt = {
					width: 640,
					theme: theme,
					columnsresize: true,
					autoheight: true,
					autorowheight: true,
					showheader: false,
					selectionmode: 'multiplecells',
					columns: [
						{text: '1', columntype: 'textbox', datafield: '1', width: 80 },
						{text: '2', columntype: 'textbox', datafield: '2', width: 80 },
						{text: '3', columntype: 'textbox', datafield: '3', width: 80 },
						{text: '4', columntype: 'textbox', datafield: '4', width: 80 },
						{text: '5', columntype: 'textbox', datafield: '5', width: 80 },
						{text: '6', columntype: 'textbox', datafield: '6', width: 80 },
						{text: '7', columntype: 'textbox', datafield: '7', width: 80 },
						{text: '8', columntype: 'textbox', datafield: '8', width: 80 }
					]
				};

				var usr_items = get_nametags('#jqxgrid_user_list');
				var msg_items = get_nametags('#jqxgrid_msg_list');

				var add_value = function(list_str, value) {
					if (list_str == '') {
						return value;
					}
					var arr = list_str.split(',');
					if (arr.indexOf(value) === -1) {
						arr.push(value);
						return arr.join(',');
					}
					return list_str;
				};

				var del_value = function(list_str, value) {
					if (list_str == '') {
						return '';
					}
					var arr = list_str.split(',');
					var index = arr.indexOf(value);
					if (index !== -1) {
						arr.splice(index, 1);
						return arr.join(',');
					}
					return list_str;
				};

				if (this.hasOwnProperty('target_src')) {
					this.target_src.source_ori.localdata = make_array_data($.merge(usr_items[1], usr_items[0]));
					this.target_src.dataBind();
					this.message_src.source_ori.localdata = make_array_data($.merge(msg_items[1], msg_items[0]));
					this.message_src.dataBind();

					$('#sched_target').jqxDropDownButton('setContent', data_record.target_device);
					$('#sched_message').jqxDropDownButton('setContent', data_record.sched_msg);
				} else {
					var create_dropgird = function (drop_id, ini_grid, source_adpt, data_val) {
						$(drop_id).jqxDropDownButton('setContent', data_val);
						$(drop_id).bind('open', function () { 
							var old_val = $(drop_id).jqxDropDownButton('getContent');
							var arr = old_val.split(',');
							var localdatas = source_adpt.source_ori.localdata;
							var new_val = [];
							$.each(arr, function(i, target) {
								$.each(localdatas, function(index, line) {
									var found = false;
									$.each(line, function(fieldname, value) {
										if (target == value) {
											$(ini_grid).jqxGrid('selectcell', index, fieldname);
											found = true;
											return false;
										}
									});
									if (found) {
										new_val.push(target);
										return false;
									}
								});
							});
							var new_text = new_val.join(',');
							$(drop_id).jqxDropDownButton('setContent', new_text);
						});
						$(drop_id).bind('close', function () { 
							var old_val = $(drop_id).jqxDropDownButton('getContent');
							$('#sched_target_grid').jqxGrid('clearselection');
							$('#sched_message_grid').jqxGrid('clearselection');
							$(drop_id).jqxDropDownButton('setContent', old_val);
						});
						$(ini_grid).jqxGrid($.extend({source: source_adpt}, pop_opt));
						$(ini_grid).on('cellselect', function (event) {
							var value = $(ini_grid).jqxGrid('getcellvalue', event.args.rowindex, event.args.datafield);
							if (value == '') {return;} 
							var old_val = $(drop_id).jqxDropDownButton('getContent');
							var new_val = add_value(old_val, value);
							if (old_val === new_val) {return;}
							$(drop_id).jqxDropDownButton('setContent', new_val);
						});
						$(ini_grid).on('cellunselect', function (event) {
							var value = $(ini_grid).jqxGrid('getcellvalue', event.args.rowindex, event.args.datafield);
							if (value == '') {return;}; 
							var old_val = $(drop_id).jqxDropDownButton('getContent');
							var new_val = del_value(old_val, value);
							if (old_val === new_val) {return;}
							$(drop_id).jqxDropDownButton('setContent', new_val);
						});
					};

					this.target_src = get_source($.merge(usr_items[1], usr_items[0]));
					this.message_src = get_source($.merge(msg_items[1], msg_items[0]));
					create_dropgird('#sched_target', '#sched_target_grid', this.target_src, data_record.target_device);
					create_dropgird('#sched_message', '#sched_message_grid', this.message_src, data_record.sched_msg);
				}
			},
			extra_form : function () {
				var new_raw = {};
				new_raw['status'] = source_sched_status_cn[$("#sched_status").jqxDropDownList('getSelectedIndex')];
				new_raw['start_time'] = $('#sched_start').jqxDateTimeInput('getDate');
				new_raw['finish_time'] = $('#sched_end').jqxDateTimeInput('getDate');
				new_raw['times'] = $('#sched_times').jqxNumberInput('getDecimal');
				new_raw['time_interval'] = source_sched_inval_cn[$("#sched_interval").jqxDropDownList('getSelectedIndex')];
				new_raw['time_interval_pre'] = $('#sched_interval_pre').jqxNumberInput('getDecimal');
				new_raw['time_interval_mode'] = source_schedmode_cn[$("#sched_interval_mode").jqxDropDownList('getSelectedIndex')];
				new_raw['msg_sequence'] = source_sequence_cn[$("#sched_sequence").jqxDropDownList('getSelectedIndex')];
				new_raw['repel'] = source_repel_cn[$("#sched_repel").jqxDropDownList('getSelectedIndex')];
				new_raw['target_device'] = $('#sched_target').jqxDropDownButton('getContent');
				new_raw['sched_msg'] = $('#sched_message').jqxDropDownButton('getContent');
				return new_raw;
			},
			editrow : -1,
			elemHeight : 23,
			popHeight : 434,
			popWidth : 520,
			list_name : 'sched',
			add_button_id : '#addrowbutton_sched',
			del_button_id : '#deleterowbutton_sched',
			update_button_id : '#updaterowbutton_sched',
			grid_id : '#jqxgrid_sched_list',
			pop_win_id : '#popupWindow_sched',
			name_field_id : '#sched_name',
			save_id : '#Save_sched',
			cancel_id : '#Cancel_sched'
		};

		var userlst_data = {
			editrow : -1,
			elemHeight : 23,
			popHeight : 560,
			popWidth : 550,
			list_name : 'user',
			data_fields : [
				{name: 'name', type: 'string'},
				{name: 'tags', type: 'string'},
				{name: 'browser', type: 'string'},
				{name: 'platform', type: 'string'},
				{name: 'device_name', type: 'string'},
				{name: 'region', type: 'string'},
				{name: 'UserAgent', type: 'string'},
				{name: 'stay_time', type: 'string'},
				{name: 'all_times_range', type: 'string'},
				{name: 'times_range', type: 'string'},
				{name: 'ismobiledevice', type: 'string'},
				{name: 'new_user', type: 'string'},
				{name: 'new_visitor', type: 'string'},
				{name: 'binded', type: 'string'},
				{name: 'bind_account', type: 'string'},
				{name: 'Visiting', type: 'string'}
			],
			data_columns : [
				{text: '规则名称', datafield: 'name', width: 100},
				{text: '分类标签', datafield: 'tags', width: 72},
				{text: '浏览器', datafield: 'browser', width: 72},
				{text: '操作系统', datafield: 'platform', width: 72},
				{text: '设备名', datafield: 'device_name', width: 72},
				{text: '地区', datafield: 'region', width: 72},
				{text: '浏览器正则', datafield: 'UserAgent', width: 72},
				{text: '停留', datafield: 'stay_time', width: 37},
				{text: '总数', datafield: 'all_times_range', width: 37},
				{text: '次数', datafield: 'times_range', width: 37},
				{text: '移动', datafield: 'ismobiledevice', width: 32},
				{text: '新人', datafield: 'new_user', width: 32},
				{text: '再访', datafield: 'new_visitor', width: 32},
				{text: '注册', datafield: 'binded', width: 32},
				{text: '账户名', datafield: 'bind_account', width: 80},
				{text: '访问网址正则', datafield: 'Visiting', width: 105},
			],

			add_button_id : '#addrowbutton_user',
			del_button_id : '#deleterowbutton_user',
			update_button_id : '#updaterowbutton_user',
			grid_id : '#jqxgrid_user_list',
			pop_win_id : '#popupWindow_user',
			name_field_id : '#usr_name',
			save_id : '#Save_user',
			cancel_id : '#Cancel_user',

			create_form: function(){
				var base_opt = {theme: theme, width: 400, height: this.elemHeight};
				var list_opt = $.extend({}, base_opt, {selectedIndex:0, width: 120});
				var range_opt = $.extend({}, list_opt, {selectedIndex:0, width: 200});
				$("#usr_tags").jqxInput(base_opt);
				$("#usr_newuser").jqxDropDownList($.extend({source:source_newuser_cn}, list_opt));
				$("#usr_visitor").jqxDropDownList($.extend({source:source_newvisitor_cn}, list_opt));
				$("#usr_mobile").jqxDropDownList($.extend({source:source_mobile_cn}, list_opt));
				$("#usr_binded").jqxDropDownList($.extend({source:source_binded_cn}, list_opt));

				var source_staytime = ['0-60','61-180','181-300','301-600','601-1200','1201-1800','1801-2700','2701-3600','3601-7200'];
				var source_alltimesrange = [];
				var source_timesrange = [];

				$("#usr_stay_time").jqxDropDownList($.extend({checkboxes:true, source:source_staytime}, range_opt));
				$("#usr_all_times_range").jqxDropDownList($.extend({checkboxes:true,source:source_alltimesrange}, range_opt));
				$("#usr_times_range").jqxDropDownList($.extend({checkboxes:true,source:source_timesrange}, range_opt));

				$("#usr_browser").jqxInput(base_opt);
				$("#usr_platform").jqxInput(base_opt);
				$("#usr_device").jqxInput(base_opt);
				$("#usr_region").jqxInput(base_opt);
				$("#usr_account").jqxInput(base_opt);
				$("#usr_useragent").jqxInput(base_opt);
				$("#usr_visiting").jqxInput(base_opt);
			},

			fill_form : function(data_record) {
				if (!data_record.hasOwnProperty('new_user')) {
					data_record.new_user = source_newuser_cn[0];
				}
				if (!data_record.hasOwnProperty('new_visitor')) {
					data_record.new_visitor = source_newvisitor_cn[0];
				}
				if (!data_record.hasOwnProperty('ismobiledevice')) {
					data_record.ismobiledevice = source_mobile_cn[0];
				}
				if (!data_record.hasOwnProperty('binded')) {
					data_record.binded = source_binded_cn[0];
				}
				$('#usr_tags').val(data_record.tags);
				$("#usr_newuser").jqxDropDownList({selectedIndex: source_newuser_cn.indexOf(data_record.new_user)}); 
				$("#usr_visitor").jqxDropDownList({selectedIndex: source_newvisitor_cn.indexOf(data_record.new_visitor)}); 
				$("#usr_mobile").jqxDropDownList({selectedIndex: source_mobile_cn.indexOf(data_record.ismobiledevice)}); 
				$("#usr_binded").jqxDropDownList({selectedIndex: source_binded_cn.indexOf(data_record.binded)}); 
				$('#usr_browser').val(data_record.browser);
				$('#usr_platform').val(data_record.platform);
				$('#usr_device').val(data_record.device_name);
				$('#usr_region').val(data_record.region);
				$('#usr_account').val(data_record.bind_account);
				$('#usr_useragent').val(data_record.UserAgent);
				$('#usr_visiting').val(data_record.Visiting);
			},

			extra_form : function () {
				var check = function(d) {return d?d:'--'};
				var getid = function(d) {var id = $(d).jqxDropDownList('getSelectedIndex');return (id>=0)?id:0;};
				var new_raw = {};
				new_raw['tags'] = rm_comma($('#usr_tags').val());
				new_raw['new_user'] = source_newuser_cn[getid("#usr_newuser")];
				new_raw['new_visitor'] = source_newvisitor_cn[getid("#usr_visitor")];
				new_raw['ismobiledevice'] = source_mobile_cn[getid("#usr_mobile")];
				new_raw['binded'] = source_binded_cn[getid("#usr_binded")];
				new_raw['browser'] = check($('#usr_browser').val());
				new_raw['platform'] = check($('#usr_platform').val());
				new_raw['device_name'] = check($('#usr_device').val());
				new_raw['region'] = check($('#usr_region').val());
				new_raw['bind_account'] = check($('#usr_account').val());
				new_raw['UserAgent'] = check($('#usr_useragent').val());
				new_raw['Visiting'] = check($('#usr_visiting').val());
				return new_raw;
			}
		};

		/**********************************
		消息库UI代码
		**********************************/

		var msg_lst_data = {
			editrow : -1,
			elemHeight : 23,
			popHeight : 430,
			popWidth : 550,
			list_name : 'message',
			data_fields : [
				{name: 'name', type: 'string'},
				{name: 'tags', type: 'string'},
				{name: 'title', type: 'string'},
				{name: 'text', type: 'string'},
				{name: 'msgmod', type: 'string'},
				{name: 'position', type: 'string'},
				{name: 'sticky', type: 'string'},
				{name: 'time', type: 'string'},
				{name: 'before_open', type: 'string'}
			],
			data_columns : [
				{ text: '消息名称', datafield: 'name', width: 130 },
				{ text: '分类标签', datafield: 'tags', width: 80 },
				{ text: '消息标题', datafield: 'title', width: 150 },
				{ text: '消息内容', datafield: 'text', width: 408},
				{ text: '类型', datafield: 'msgmod', width: 32},
				{ text: '位置', datafield: 'position', width: 32},
				{ text: '显退', datafield: 'sticky', width: 32, cellsalign: 'right'},
				{ text: '显示时长', datafield: 'time', width: 60, cellsalign: 'right'},
				{ text: '弹窗', datafield: 'before_open', width: 32, cellsalign: 'right'}
			],

			add_button_id : '#addrowbutton',
			del_button_id : '#deleterowbutton',
			update_button_id : '#updaterowbutton',
			grid_id : '#jqxgrid_msg_list',
			pop_win_id : '#popupWindow_msg',
			name_field_id : '#msg_name',
			save_id : '#Save_msg',
			cancel_id : '#Cancel_msg',

			create_form: function(){
				$("#msg_tags").jqxInput({theme: theme, width: 400, height: this.elemHeight});
				$("#msg_title").jqxComboBox({theme: theme,source: source_notify_title, selectedIndex:0, width: 400, height: this.elemHeight});
				$("#msg_content").jqxInput({theme: theme,source:countries, width: 400, height: 84});
				$("#msg_msgmode").jqxDropDownList({source:source_msgmod_cn, selectedIndex:1, theme: theme, width: 120, height: this.elemHeight});
				$("#msg_position").jqxDropDownList({source:source_posi_cn, selectedIndex:2, theme: theme, width: 120, height: this.elemHeight});
				$("#msg_sticky").jqxDropDownList({source:source_sticky_cn, selectedIndex:0, theme: theme, width: 120, height: this.elemHeight});
				$("#msg_time").jqxNumberInput({theme: theme,symbol:'秒',symbolPosition:'right',min:1,decimal:8,decimalDigits:0, 
								inputMode:'simple',spinButtons:true, width: 120,  height: this.elemHeight});
				$("#msg_before_open").jqxDropDownList({source:source_warning_cn, selectedIndex:0, theme: theme, width: 120, height: this.elemHeight});
			},

			fill_form : function(data_record) {
			    	if (!data_record.hasOwnProperty('msgmod')) {
					data_record.msgmod = source_msgmod_cn[1];
				}
			    	if (!data_record.hasOwnProperty('position')) {
					data_record.position = source_posi_cn[2];
				}
			    	if (!data_record.hasOwnProperty('sticky')) {
					data_record.sticky = source_sticky_cn[0];
				}
			    	if (!data_record.hasOwnProperty('time')) {
					data_record.time = 8000;
				}
			    	if (!data_record.hasOwnProperty('before_open')) {
					data_record.before_open = source_warning_cn[0];
				}
				$("#msg_tags").val(data_record.tags);
				$('#msg_title').jqxComboBox('val', data_record.title);
				$("#msg_content").val(data_record.text);
				$("#msg_msgmode").jqxDropDownList({selectedIndex: source_msgmod_cn.indexOf(data_record.msgmod)}); 
				$("#msg_position").jqxDropDownList({selectedIndex: source_posi_cn.indexOf(data_record.position)}); 
				$("#msg_sticky").jqxDropDownList({selectedIndex: source_sticky_cn.indexOf(data_record.sticky)}); 
				$('#msg_time').jqxNumberInput('setDecimal', data_record.time / 1000);
				$("#msg_before_open").jqxDropDownList({selectedIndex: source_warning_cn.indexOf(data_record.before_open)}); 
			},

			extra_form : function () {
				var getid = function(d) {var id = $(d).jqxDropDownList('getSelectedIndex');return (id>=0)?id:0;};
				var new_raw = {};
				new_raw['tags'] = rm_comma($('#msg_tags').val());
				new_raw['title'] = $('#msg_title').jqxComboBox('val');
				new_raw['text'] = rm_space($('#msg_content').val());
				new_raw['msgmod'] = source_msgmod_cn[getid("#msg_msgmode")];
				new_raw['position'] = source_posi_cn[getid("#msg_position")];
				new_raw['sticky'] = source_sticky_cn[getid("#msg_sticky")];
				new_raw['time'] = $('#msg_time').jqxNumberInput('getDecimal') * 1000;
				new_raw['before_open'] = source_warning_cn[getid("#msg_before_open")];
				return new_raw;
			}
		};

		init_grid(sched_lst_data);
		init_grid(userlst_data);
		init_grid(msg_lst_data);

		function init_grid(p)
		{
			var adpt_source = {
				url: 'data.php?opt=list&cmd='+p.list_name,
				datatype: "jsonp",
				datafields: p.data_fields,
				addrow: function (rowid, rowdata, position, commit) {
					handle_list_remote('data.php?opt=create&cmd='+p.list_name, rowdata, commit);
				},
				deleterow: function (rowid, commit) {
					var rowdata = $(p.grid_id).jqxGrid('getrowdatabyid', rowid);
					handle_list_remote('data.php?opt=delete&cmd='+p.list_name, rowdata, commit);
				},
				updaterow: function (rowid, newdata, commit) {
					handle_list_remote('data.php?opt=update&cmd='+p.list_name, newdata, commit);
				}
			};

			var dataAdapter = new $.jqx.dataAdapter(adpt_source, {
				beforeLoadComplete: en2cn,
				processData: function (data) {
					//console.log(data);
				}
				});

			$(p.grid_id).jqxGrid({
				source: dataAdapter,
				theme: theme,
				sortable: true,
				width: '100%',
				enableellipsis: false,
				autoheight: true,
				autorowheight: true,
				columns: p.data_columns
			});

			//数据定义完毕，下面是定义ui控件


			$(p.add_button_id).jqxButton({ theme: theme, width: 70});
			$(p.del_button_id).jqxButton({ theme: theme, width: 70});
			$(p.update_button_id).jqxButton({ theme: theme, width: 70});

			$(p.add_button_id).on('click', function () {
				var data_record = {};
				var selectedrowindex = $(p.grid_id).jqxGrid('getselectedrowindex');
				if (selectedrowindex >= 0) {
					var data_record = $(p.grid_id).jqxGrid('getrowdata', selectedrowindex);
				}
				p.editrow = -1;
				p.fill_form(data_record);
				$(p.name_field_id).jqxInput({disabled: false});
				$(p.name_field_id).select();
				$(p.pop_win_id).jqxWindow({position:'center'});
				$(p.pop_win_id).jqxWindow('open');
			});
			$(p.update_button_id).on('click', function () {
				var selectedrowindex = $(p.grid_id).jqxGrid('getselectedrowindex');
				var rowscount = $(p.grid_id).jqxGrid('getdatainformation').rowscount;
				if (selectedrowindex >= 0 && selectedrowindex < rowscount) {
					p.editrow = selectedrowindex;
					var data_record = $(p.grid_id).jqxGrid('getrowdata', selectedrowindex);
					p.fill_form(data_record);
					$(p.name_field_id).val(data_record.name);

					$(p.name_field_id).jqxInput({disabled: true});
					$(p.pop_win_id).jqxWindow({position:'center'});
					$(p.pop_win_id).jqxWindow('open');
				}
			});
			$(p.del_button_id).on('click', function () {
				var selectedrowindex = $(p.grid_id).jqxGrid('getselectedrowindex');
				var rowscount = $(p.grid_id).jqxGrid('getdatainformation').rowscount;
				if (selectedrowindex >= 0 && selectedrowindex < rowscount) {
					var id = $(p.grid_id).jqxGrid('getrowid', selectedrowindex);
					$(p.grid_id).jqxGrid('deleterow', id);
				}
			});

			$(p.pop_win_id).jqxWindow({
				height: p.popHeight, 
				width: p.popWidth,
				resizable: false, 
				theme: theme, 
				isModal: true, 
				autoOpen: false, 
				cancelButton: $(p.cancel_id), 
				modalOpacity: 0.01           
			});

			p.create_form();

			$(p.name_field_id).jqxInput({theme: theme, width: 400, height: p.elemHeight});
			$(p.save_id).jqxButton({width: 100, height:40, theme: theme });
			$(p.cancel_id).jqxButton({width: 76, height:40, theme: theme });
			$(p.save_id).click(function () {
				var fixed_name = function (msg_name) {
					var rows = $(p.grid_id).jqxGrid('getrows');
					var succeed;
					var now_name = rm_space(rm_comma(msg_name));
					
					do {
						succeed = true;
						$.each(rows, function(index, value) {
							if (now_name == value.name) {
								if (now_name.match(/(^[\s\S]+)_([\d]+$)/g)) {
									now_name = RegExp.$1 + '_' + ++(RegExp.$2);
								} else {
									now_name = now_name + '_1';
								}
								succeed = false;
								return false;
							}
						});
					} while(!succeed);
					return now_name;
				}

				var new_raw = p.extra_form();
				new_raw['name'] = (p.editrow>=0) ? $(p.name_field_id).val() : fixed_name($(p.name_field_id).val());

				if (p.editrow >= 0) {
					var rowID = $(p.grid_id).jqxGrid('getrowid', p.editrow);
					$(p.grid_id).jqxGrid('updaterow', rowID, new_raw);
				} else {
					$(p.grid_id).jqxGrid('addrow', null, new_raw);
				}
				$(p.pop_win_id).jqxWindow('hide');
				$(p.grid_id).jqxGrid('ensurerowvisible', p.editrow);
			});
		}



	});

	function rm_comma (d) {
		return d.replace(/,/g, '');
	}

	function rm_space (d) {
		return d.replace(/(\r\n|\n|\r)/gm,"");
	}
}
