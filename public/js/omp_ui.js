function api_ui_init(aDataSet)
{
	var theme = '';
	//预存消息管理
	var source_posi = ['top-left','bottom-left','top-right','bottom-right'];
	var source_posi_cn = ['页面左上方','页面左下方','页面右上方','页面右下方'];
	var source_msgmod = ['realtime', 'heartbeat'];
	var source_msgmod_cn = ['实时消息','异步消息'];
	var source_msgform = ['popup', 'replace'];
	var source_msgform_cn = ['弹出显示','替换显示'];
	var source_sticky = ['false','true'];
	var source_sticky_cn = ['自动消退','固定显示'];
	var source_warning = ['false','true'];
	var source_warning_cn = ['没有警示','强制警示'];
	var source_notify_title = ['通知','活动通知','抽奖活动','紧急通知','会议通知'];

	//发送任务管理
	var source_sched_status = ['start', 'stop', 'waiting', 'running', 'timeout'];
	var source_sched_status_cn = ['开始', '停止', '待命','运行', '过时'];
	var source_sched_statuscn = ['开始', '停止'];
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
	var source_bool = [source_null, 'true', 'false'];
	var source_newuser = source_bool;
	var source_newuser_cn = [source_null, '首次访问', '后续访问'];
	var source_newvisitor = source_bool;
	var source_newvisitor_cn = [source_null, '第一页', '后续页面'];
	var source_mobile = source_bool;
	var source_mobile_cn = [source_null, '移动设备', '其他设备'];
	var source_binded = source_bool;
	var source_binded_cn = [source_null, '已注册', '未注册'];
	
	//替换规则库
	var source_insert = ['before','after','inside-first','inside-append'];
	var source_insert_cn = ['前面','后面','里面前','里面后'];
	var source_action = ['none','hide','delete'];
	var source_action_cn = ['不处理','隐藏','删除'];

	//账户识别库
	var source_active = ['true', 'false'];
	var source_active_cn = ['是', '否'];

	function cn2en(d) {
		if (d.hasOwnProperty('name')) {
			set_property(d, 'insert', source_insert_cn, source_insert);
			set_property(d, 'action', source_action_cn, source_action);
			set_property(d, 'msgmod', source_msgmod_cn, source_msgmod);
			set_property(d, 'msgform', source_msgform_cn, source_msgform);
			set_property(d, 'position', source_posi_cn, source_posi);
			set_property(d, 'sticky', source_sticky_cn, source_sticky);
			set_property(d, 'before_open', source_warning_cn, source_warning);
			set_property(d, 'new_user', source_newuser_cn, source_newuser);
			set_property(d, 'new_visitor', source_newvisitor_cn, source_newvisitor);
			set_property(d, 'ismobiledevice', source_mobile_cn, source_mobile);
			set_property(d, 'binded', source_binded_cn, source_binded);
			set_property(d, 'status', source_sched_status_cn, source_sched_status);
			set_property(d, 'time_interval', source_sched_inval_cn, source_sched_inval);
			set_property(d, 'time_interval_mode', source_schedmode_cn, source_schedmode);
			set_property(d, 'msg_sequence', source_sequence_cn, source_sequence);
			set_property(d, 'repel', source_repel_cn, source_repel);
			set_property(d, 'active', source_active_cn, source_active);
		} else {
			$(d).each(function() {
				cn2en(this);
			});
		}
		return d;
	}

	function en2cn(d) {
		if (d.hasOwnProperty('name')) {
			set_property(d, 'insert', source_insert, source_insert_cn);
			set_property(d, 'action', source_action, source_action_cn);
			set_property(d, 'msgmod', source_msgmod, source_msgmod_cn);
			set_property(d, 'msgform', source_msgform, source_msgform_cn);
			set_property(d, 'position', source_posi, source_posi_cn);
			set_property(d, 'sticky', source_sticky, source_sticky_cn);
			set_property(d, 'before_open', source_warning, source_warning_cn);
			set_property(d, 'new_user', source_newuser, source_newuser_cn);
			set_property(d, 'new_visitor', source_newvisitor, source_newvisitor_cn);
			set_property(d, 'ismobiledevice', source_mobile, source_mobile_cn);
			set_property(d, 'binded', source_binded, source_binded_cn);
			set_property(d, 'status', source_sched_status, source_sched_status_cn);
			set_property(d, 'time_interval', source_sched_inval, source_sched_inval_cn);
			set_property(d, 'time_interval_mode', source_schedmode, source_schedmode_cn);
			set_property(d, 'msg_sequence', source_sequence, source_sequence_cn);
			set_property(d, 'repel', source_repel, source_repel_cn);
			set_property(d, 'active', source_active, source_active_cn);
		} else {
			$(d).each(function() {
				en2cn(this);
			});
		}
		return d;
	}

	function trans(value, from, to) {
		var index = from.indexOf(value);
		if (index === -1) {
			return value;
		} else {
			return to[index]; 
		}
	}

	function set_property(d, name, from, to) {
		(d.hasOwnProperty(name)) && (d[name] = trans(d[name], from, to));
	}

	function init_property(d, name, value) {
		if (value) {
			if (!d.hasOwnProperty(name)) {
				d[name] = value;
			}
		}
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
				//console.log(msg);
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
		var viewposi = $('#viewposi').jqxComboBox('val');
		var msgmod = $("#message-mode").jqxDropDownList('getSelectedIndex');
		var ttl = $('#notify-ttl').jqxNumberInput('getDecimal');

		var msgform = 'popup';
		var position = trans(viewposi, source_posi_cn, source_posi);
		if (source_posi_cn.indexOf(viewposi) === -1) {
			msgform = 'replace';
			if (is_grid_name(get_grid_id('#tab_posi'), viewposi)) {
				position = md5(viewposi);
			} else {
				position = viewposi;
			}
		}

		var device_id = document.cookie.match(new RegExp("(^| )device_id=([^;]*)(;|$)"));
		device_id = device_id? device_id[2] : 'null';

		if (content == '') {
			console.log('no content');
			return;
		}

		var cmdbox = new Object();
		cmdbox.name = 'manual send message';
		cmdbox.title = title;
		cmdbox.text = content;
		cmdbox.sticky = source_sticky[issticky];
		cmdbox.before_open = source_warning[iswarnning];
		cmdbox.msgmod = source_msgmod[msgmod];
		cmdbox.msgform = msgform;
		cmdbox.time = 	ttl*1000;
		cmdbox.position = position;

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
			"iCookieDuration": 3600*24*30, // 30day
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

		$("#notify-title").jqxComboBox({theme: theme,source: source_notify_title, selectedIndex:0, width:80, height:28});

		var countries = new Array();
		$("#notify-content").jqxInput({theme: theme,placeHolder:"请输入通知内容",source:countries,width:340,height:28});
		$("#send-button").jqxButton({ width: 76, height:30, theme: theme });

		$("#send-button").on('click', send_omp_message);
		$("#viewposi").jqxComboBox({source:source_posi_cn, selectedIndex:2,width: 165, height: 28, theme: theme,autoDropDownHeight:true });
		$('#viewposi').on('open', function (event) {
			var items = get_nametags(get_grid_id('#tab_posi'));
			var names = items[0];
			if (names.length > 0) {
				var source_view = $.extend([], source_posi_cn);
				source_view = source_view.concat(names);
				$("#viewposi").jqxComboBox({source: source_view});
			}
		}); 

		$("#property-panel").jqxPanel({theme: theme, height: 30, width:534, theme: theme });
		$("#message-mode").jqxDropDownList({source:source_msgmod_cn, selectedIndex:1,width: 76, height: 28, theme: theme,autoDropDownHeight:true});
		$("#notify-ttl").jqxNumberInput({theme: theme,symbol:'秒',symbolPosition:'right',min:1,decimal:8,decimalDigits:0,width:55,height:28, inputMode:'simple',spinButtons:true});
		$("#notify-ttl").jqxTooltip({theme: theme, content: '通知延迟关闭时间', position: 'mouse'});
		$("#issticky").jqxDropDownList({source:source_sticky_cn, selectedIndex:0,width: 76, height: 28, theme: theme,autoDropDownHeight:true });
		$("#iswarnning").jqxDropDownList({source:source_warning_cn, selectedIndex:0,width: 76, height: 28, theme: theme,autoDropDownHeight:true });

		$('#jqxTabs').jqxTabs({
			width:958,
			position:'top',
			theme:theme,
			//animationType: 'fade',
			contentTransitionDuration: 500,
			scrollable:false,
			selectedItem: 0,
			});


		/**********************************
		终端分类库UI代码
		**********************************/
		var popup_lst_data = {
			editrow : -1,
			elemHeight : 23,
			popHeight : 434,
			popWidth : 520,
			list_name : 'sched',
			container_id: '#tab_sched',
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
				{text: '任务名称', datafield: 'name', width: 86},
				{text: '状态', datafield: 'status', width: 32},
				{text: '开始时间', datafield: 'start_time', width: 90, cellsformat:'yyyy-MM-dd HH:mm:ss'},
				{text: '结束时间', datafield: 'finish_time', width: 90, cellsformat:'yyyy-MM-dd HH:mm:ss'},
				{text: '次数', datafield: 'times', width: 40},
				{text: '每次', datafield: 'time_interval', width: 50},
				{text: '前距', datafield: 'time_interval_pre', width: 32},
				{text: '模式', datafield: 'time_interval_mode', width: 32},
				{text: '顺序', datafield: 'msg_sequence', width: 32},
				{text: '互斥', datafield: 'repel', width: 32},
				{text: '发送目标', datafield: 'target_device', width: 220},
				{text: '发送消息', datafield: 'sched_msg', width: 220}
			],
			create_form: function(table_id){
				var src_filter = function(item) {
					return (trans(item.msgform, source_msgform_cn, source_msgform) === 'popup');
				};
				new_dropdown_grid(table_id, '目标人群：', '#sched_target', '#tab_user', null, 400, this.elemHeight);
				new_dropdown_grid(table_id, '消息集合：', '#sched_message', '#tab_message', src_filter,  400, this.elemHeight);
				new_dropdown(table_id, '运行状态：', '#sched_status', 120, this.elemHeight, source_sched_statuscn, 0);
				new_datatime(table_id, '开始时间：', '#sched_start',200, this.elemHeight);
				new_datatime(table_id, '结束时间：', '#sched_end',200, this.elemHeight);
				new_number(table_id, '执行次数：', '#sched_times',120, this.elemHeight, '次', -1, -1);
				new_dropdown(table_id, '每次间隔：', '#sched_interval', 120, this.elemHeight, source_sched_inval_cn, 2);
				new_number(table_id, '前距时间：', '#sched_interval_pre',120, this.elemHeight, '秒', 0, 0);
				new_dropdown(table_id, '间隔模式：', '#sched_interval_mode', 120, this.elemHeight, source_schedmode_cn, 0);
				new_dropdown(table_id, '消息顺序：', '#sched_sequence', 120, this.elemHeight, source_sequence_cn, 0);
				new_dropdown(table_id, '任务互斥：', '#sched_repel', 120, this.elemHeight, source_repel_cn, 0);
			},
			fill_form : function(data_record) {
				fill_dropdown_button('#sched_target', data_record, 'target_device');
				fill_dropdown_button('#sched_message', data_record, 'sched_msg');
				fill_datetime('#sched_start', data_record, 'start_time');
				fill_datetime('#sched_end', data_record, 'finish_time');
				fill_dropdown('#sched_status', data_record, 'status', source_sched_statuscn, 0);
				fill_dropdown('#sched_interval', data_record, 'time_interval', source_sched_inval_cn, 0);
				fill_dropdown('#sched_interval_mode', data_record, 'time_interval_mode', source_schedmode_cn, 0);
				fill_dropdown('#sched_sequence', data_record, 'msg_sequence', source_sequence_cn, 0);
				fill_dropdown('#sched_repel', data_record, 'repel', source_repel_cn, 0);
				fill_number('#sched_times', data_record, 'times');
				fill_number('#sched_interval_pre', data_record, 'time_interval_pre');
			},
			extra_form : function () {
				var new_raw = {};
				extra_dropdown_button(new_raw, '#sched_target', 'target_device');
				extra_dropdown_button(new_raw, '#sched_message', 'sched_msg');
				extra_datetime(new_raw, '#sched_start', 'start_time');
				extra_datetime(new_raw, '#sched_end', 'finish_time');
				extra_dropdown(new_raw, '#sched_status', 'status');
				extra_dropdown(new_raw, '#sched_interval', 'time_interval');
				extra_dropdown(new_raw, '#sched_interval_mode', 'time_interval_mode');
				extra_dropdown(new_raw, '#sched_sequence', 'msg_sequence');
				extra_dropdown(new_raw, '#sched_repel', 'repel');
				extra_number(new_raw, '#sched_times', 'times');
				extra_number(new_raw, '#sched_interval_pre', 'time_interval_pre');
				return new_raw;
			}
		};

		var replace_lst_data = {
			editrow : -1,
			elemHeight : 23,
			popHeight : 400,
			popWidth : 520,
			list_name : 'replace',
			container_id: '#tab_replace',
			data_fields : [
				{name: 'name', type: 'string'},
				{name: 'status', type: 'string'},
				{name: 'start_time', type: 'date'},
				{name: 'finish_time', type: 'date'},
				{name: 'times', type: 'string'},
				{name: 'max_perpage', type: 'string'},
				{name: 'interval', type: 'string'},
				{name: 'interval_pre', type: 'string'},
				{name: 'msg_sequence', type: 'string'},
				{name: 'target_device', type: 'string'},
				{name: 'replace_msg', type: 'string'}
			],
			data_columns : [
				{text: '任务名称', datafield: 'name', width: 86},
				{text: '状态', datafield: 'status', width: 32},
				{text: '开始时间', datafield: 'start_time', width: 90, cellsformat:'yyyy-MM-dd HH:mm:ss'},
				{text: '结束时间', datafield: 'finish_time', width: 90, cellsformat:'yyyy-MM-dd HH:mm:ss'},
				{text: '次数', datafield: 'times', width: 32},
				{text: '个数', datafield: 'max_perpage', width: 32},
				{text: '间隔', datafield: 'interval', width: 32},
				{text: '前隔', datafield: 'interval_pre', width: 32},
				{text: '顺序', datafield: 'msg_sequence', width: 32},
				{text: '发送目标', datafield: 'target_device', width: 220},
				{text: '替换消息', datafield: 'replace_msg', width: 278}
			],
			create_form: function(table_id){
				var src_filter = function(item) {
					return (trans(item.msgform, source_msgform_cn, source_msgform) === 'replace');
				};
				new_dropdown_grid(table_id, '目标人群：', '#replace_target', '#tab_user', null, 400, this.elemHeight);
				new_dropdown_grid(table_id, '消息集合：', '#replace_message', '#tab_message', src_filter,  400, this.elemHeight);
				new_dropdown(table_id, '运行状态：', '#replace_status', 120, this.elemHeight, source_sched_statuscn, 0);
				new_datatime(table_id, '开始时间：', '#replace_start',200, this.elemHeight);
				new_datatime(table_id, '结束时间：', '#replace_end',200, this.elemHeight);
				new_number(table_id, '执行次数：', '#replace_times',120, this.elemHeight, '次', -1, -1);
				new_number(table_id, '单页个数：', '#replace_maxppv',120, this.elemHeight, '次', -1, -1);

				new_number(table_id, '间隔PV：', '#replace_interval',120, this.elemHeight, '次', 0, 0);
				new_number(table_id, '前距PV：', '#replace_interval_pre',120, this.elemHeight, '次', 0, 0);
				new_dropdown(table_id, '消息顺序：', '#replace_sequence', 120, this.elemHeight, source_sequence_cn, 0);
			},
			fill_form : function(data_record) {
				fill_dropdown_button('#replace_target', data_record, 'target_device');
				fill_dropdown_button('#replace_message', data_record, 'replace_msg');
				fill_dropdown('#replace_status', data_record, 'status', source_sched_statuscn, 0);
				fill_datetime('#replace_start', data_record, 'start_time');
				fill_datetime('#replace_end', data_record, 'finish_time');
				fill_number('#replace_times', data_record, 'times');
				fill_number('#replace_maxppv', data_record, 'max_perpage');
				fill_number('#replace_interval', data_record, 'interval');
				fill_number('#replace_interval_pre', data_record, 'interval_pre');
				fill_dropdown('#replace_sequence', data_record, 'msg_sequence', source_sequence_cn, 0);
			},
			extra_form : function () {
				var new_raw = {};
				extra_dropdown_button(new_raw, '#replace_target', 'target_device');
				extra_dropdown_button(new_raw, '#replace_message', 'replace_msg');
				extra_dropdown(new_raw, '#replace_status', 'status');
				extra_datetime(new_raw, '#replace_start', 'start_time');
				extra_datetime(new_raw, '#replace_end', 'finish_time');
				extra_number(new_raw, '#replace_times', 'times');
				extra_number(new_raw, '#replace_maxppv', 'max_perpage');
				extra_number(new_raw, '#replace_interval', 'interval');
				extra_number(new_raw, '#replace_interval_pre', 'interval_pre');
				extra_dropdown(new_raw, '#replace_sequence', 'msg_sequence');
				return new_raw;
			},
		};

		var userlst_data = {
			editrow : -1,
			elemHeight : 23,
			popHeight : 620,
			popWidth : 560,
			list_name : 'user',
			container_id: '#tab_user',
			data_fields : [
				{name: 'name', type: 'string'},
				{name: 'tags', type: 'string'},
				{name: 'browser', type: 'string'},
				{name: 'platform', type: 'string'},
				{name: 'device_name', type: 'string'},
				{name: 'region', type: 'string'},
				{name: 'language', type: 'string'},
				{name: 'UserAgent', type: 'string'},
				{name: 'visit_times_range', type: 'string'},
				{name: 'allpageview_range', type: 'string'},
				{name: 'pageview_range', type: 'string'},
				{name: 'stay_time', type: 'string'},
				{name: 'ismobiledevice', type: 'string'},
				{name: 'new_user', type: 'string'},
				{name: 'new_visitor', type: 'string'},
				{name: 'binded', type: 'string'},
				{name: 'bind_account', type: 'string'},
				{name: 'Visiting', type: 'string'}
			],
			data_columns : [
				{text: '规则名称', datafield: 'name', width: 110},
				{text: '分类标签', datafield: 'tags', width: 72},
				{text: '浏览器', datafield: 'browser', width: 50},
				{text: '系统', datafield: 'platform', width: 50},
				{text: '设备', datafield: 'device_name', width: 50},
				{text: '地区', datafield: 'region', width: 60},
				{text: '语言', datafield: 'language', width: 50},
				{text: 'UA正则', datafield: 'UserAgent', width: 60},
				{text: '访次', datafield: 'visit_times_range', width: 40},
				{text: '总PV', datafield: 'allpageview_range', width: 41},
				{text: '单PV', datafield: 'pageview_range', width: 41},
				{text: '停留', datafield: 'stay_time', width: 41},
				{text: '移动', datafield: 'ismobiledevice', width: 32},
				{text: '新人', datafield: 'new_user', width: 32},
				{text: '再访', datafield: 'new_visitor', width: 32},
				{text: '注册', datafield: 'binded', width: 32},
				{text: '账户名', datafield: 'bind_account', width: 70},
				{text: '访问网址正则', datafield: 'Visiting', width: 93},
			],
			create_form: function(table_id){
				new_input(table_id, '分类标签：', "#usr_tags", 400, this.elemHeight);
				new_input(table_id, '浏览器：', "#usr_browser", 400, this.elemHeight);
				new_input(table_id, '操作系统：', "#usr_platform", 400, this.elemHeight);
				new_input(table_id, '设备名：', "#usr_device", 400, this.elemHeight);
				new_dropdown(table_id, '移动设备：', '#usr_mobile', 120, this.elemHeight, source_mobile_cn, 0);
				new_input(table_id, '地区：', "#usr_region", 400, this.elemHeight);
				new_input(table_id, '语言：', "#usr_language", 400, this.elemHeight);
				new_input(table_id, '浏览器特征：', "#usr_useragent", 400, this.elemHeight);
				new_dropdown_range(table_id,'来访停留秒数：','#usr_stay_time', 400, this.elemHeight);
				new_dropdown_range(table_id,'来访次数区间：','#usr_visit_times_range', 400, this.elemHeight);
				new_dropdown_range(table_id,'总页面浏览数：', '#usr_allpageview_range', 400, this.elemHeight);
				new_dropdown_range(table_id,'页面浏览数：', '#usr_pageview_range', 400, this.elemHeight);
				new_dropdown(table_id, '新用户：', '#usr_newuser', 120, this.elemHeight, source_newuser_cn, 0);
				new_dropdown(table_id, '新访第一页：', '#usr_visitor', 120, this.elemHeight, source_newvisitor_cn, 0);
				new_dropdown(table_id, '已注册：', '#usr_binded', 120, this.elemHeight, source_binded_cn, 0);
				new_input(table_id, '账户名：', "#usr_account", 400, this.elemHeight);
				new_input(table_id, '访问网址：', "#usr_visiting", 400, this.elemHeight);
			},
			fill_form : function(data_record) {
				fill_dropdown_range('#usr_stay_time', data_record.stay_time);
				fill_dropdown_range('#usr_visit_times_range', data_record.visit_times_range);
				fill_dropdown_range('#usr_pageview_range', data_record.pageview_range);
				fill_dropdown_range('#usr_allpageview_range', data_record.allpageview_range);
				fill_input('#usr_tags', data_record, 'tags'); 
				fill_input('#usr_browser', data_record, 'browser'); 
				fill_input('#usr_platform', data_record, 'platform'); 
				fill_input('#usr_device', data_record, 'device_name'); 
				fill_input('#usr_region', data_record, 'region'); 
				fill_input('#usr_region', data_record, 'region'); 
				fill_input('#usr_language', data_record, 'language'); 
				fill_input('#usr_account', data_record, 'bind_account'); 
				fill_input('#usr_useragent', data_record, 'UserAgent'); 
				fill_input('#usr_visiting', data_record, 'Visiting'); 
				fill_dropdown('#usr_newuser', data_record, 'new_user', source_newuser_cn, 0);
				fill_dropdown('#usr_visitor', data_record, 'new_visitor', source_newvisitor_cn, 0);
				fill_dropdown('#usr_mobile', data_record, 'ismobiledevice', source_mobile_cn, 0);
				fill_dropdown('#usr_binded', data_record, 'binded', source_binded_cn, 0);
			},
			extra_form : function () {
				var new_raw = {};
				var check = function(d) {return d?d:'--'};
				extra_input(new_raw, '#usr_tags', 'tags');
				extra_input(new_raw, '#usr_browser', 'browser', check);
				extra_input(new_raw, '#usr_platform', 'platform', check);
				extra_input(new_raw, '#usr_device', 'device_name', check);
				extra_input(new_raw, '#usr_region', 'region', check);
				extra_input(new_raw, '#usr_language', 'language', check);
				extra_input(new_raw, '#usr_useragent', 'UserAgent', check);
				extra_input(new_raw, '#usr_account', 'bind_account', check);
				extra_input(new_raw, '#usr_visiting', 'Visiting', check);
				extra_dropdown(new_raw, '#usr_stay_time', 'stay_time', check);
				extra_dropdown(new_raw, '#usr_visit_times_range', 'visit_times_range', check);
				extra_dropdown(new_raw, '#usr_pageview_range', 'pageview_range', check);
				extra_dropdown(new_raw, '#usr_allpageview_range', 'allpageview_range', check);
				extra_dropdown(new_raw, '#usr_newuser', 'new_user', check);
				extra_dropdown(new_raw, '#usr_visitor', 'new_visitor', check);
				extra_dropdown(new_raw, '#usr_mobile', 'ismobiledevice', check);
				extra_dropdown(new_raw, '#usr_binded', 'binded', check);
				return new_raw;
			},
		};

		/**********************************
		消息库UI代码
		**********************************/

		var msg_lst_data = {
			editrow : -1,
			elemHeight : 23,
			popHeight : 450,
			popWidth : 550,
			list_name : 'message',
			container_id: '#tab_message',
			data_fields : [
				{name: 'name', type: 'string'},
				{name: 'tags', type: 'string'},
				{name: 'title', type: 'string'},
				{name: 'text', type: 'string'},
				{name: 'msgmod', type: 'string'},
				{name: 'msgform', type: 'string'},
				{name: 'position', type: 'string'},
				{name: 'sticky', type: 'string'},
				{name: 'time', type: 'string'},
				{name: 'before_open', type: 'string'}
			],
			data_columns : [
				{ text: '消息名称', datafield: 'name', width: 130 },
				{ text: '分类标签', datafield: 'tags', width: 80 },
				{ text: '消息标题', datafield: 'title', width: 150 },
				{ text: '消息内容', datafield: 'text', width: 318},
				{ text: '类型', datafield: 'msgmod', width: 32},
				{ text: '形式', datafield: 'msgform', width: 32},
				{ text: '位置', datafield: 'position', width: 100},
				{ text: '显退', datafield: 'sticky', width: 32, cellsalign: 'right'},
				{ text: '时长', datafield: 'time', width: 50, cellsalign: 'right'},
				{ text: '弹窗', datafield: 'before_open', width: 32, cellsalign: 'right'}
			],
			create_form: function(table_id){
				new_input(table_id, '分类标签：', "#msg_tags", 400, this.elemHeight);
				new_combobox(table_id, '消息标题：', "#msg_title", 400, this.elemHeight, source_notify_title);
				new_textarea(table_id, '消息内容：', "#msg_content", 400, 84);
				new_dropdown(table_id, '消息类型：', '#msg_msgmode', 120, this.elemHeight, source_msgmod_cn, 1);
				new_dropdown(table_id, '消息形式：', '#msg_msgform', 120, this.elemHeight, source_msgform_cn, 1);
				new_dropdown(table_id, '显示位置：', '#msg_position', 120, this.elemHeight, source_posi_cn, 2);
				new_dropdown(table_id, '固定显示：', '#msg_sticky', 120, this.elemHeight, source_sticky_cn, 0);
				new_number(table_id, '显示时长：', '#msg_time',120, this.elemHeight, '毫秒', 1, 8000);
				new_dropdown(table_id, '弹窗警示：', '#msg_before_open', 120, this.elemHeight, source_warning_cn, 0);
			},
			fill_form : function(data_record) {
				fill_input('#msg_tags', data_record, 'tags'); 
				fill_combobox('#msg_title', data_record, 'title'); 
				fill_textarea('#msg_content', data_record, 'text');
				fill_dropdown('#msg_msgmode', data_record, 'msgmod', source_msgmod_cn, 1);
				fill_dropdown('#msg_msgform', data_record, 'msgform', source_msgform_cn, 0);
				var items = get_nametags(get_grid_id('#tab_posi'));
				fill_dropdown('#msg_position', data_record, 'position', source_posi_cn, 2, items[2]);
				fill_dropdown('#msg_sticky', data_record, 'sticky', source_sticky_cn, 0);
				fill_dropdown('#msg_before_open', data_record, 'before_open', source_warning_cn, 0);
				fill_number('#msg_time', data_record, 'time', 8000);
			},
			extra_form : function () {
				var new_raw = {};
				extra_input(new_raw, '#msg_tags', 'tags');
				extra_combobox(new_raw, '#msg_title', 'title');
				extra_textarea(new_raw, '#msg_content', 'text', function(d){return rm_space(d);});
				extra_dropdown(new_raw, '#msg_msgmode', 'msgmod');
				extra_dropdown(new_raw, '#msg_msgform', 'msgform');
				extra_dropdown(new_raw, '#msg_position', 'position');
				extra_dropdown(new_raw, '#msg_sticky', 'sticky');
				extra_dropdown(new_raw, '#msg_before_open', 'before_open');
				extra_number(new_raw, '#msg_time', 'time');
				//修正可能的错误输入
				if (source_posi_cn.indexOf(new_raw.position) === -1) {
					new_raw.msgform = source_msgform_cn[1];
				} else {
					new_raw.msgform = source_msgform_cn[0];
				}
				return new_raw;
			}
		};

		/**********************************
		位置库 UI代码
		**********************************/

		var posi_lst_data = {
			editrow : -1,
			elemHeight : 23,
			popHeight : 280,
			popWidth : 550,
			list_name : 'posi',
			container_id: '#tab_posi',
			data_fields : [
				{name: 'name', type: 'string'},
				{name: 'tags', type: 'string'},
				{name: 'urls', type: 'string'},
				{name: 'selectors', type: 'string'},
				{name: 'insert', type: 'string'}, //before or after
				{name: 'action', type: 'string'} //hide or delete
			],
			data_columns : [
				{ text: '定位名称', datafield: 'name', width: 140},
				{ text: '分类标签', datafield: 'tags', width: 70},
				{ text: 'URL正则', datafield: 'urls', width: 328},
				{ text: '选择器',  datafield: 'selectors', width: 328},
				{ text: '位置', datafield: 'insert', width: 45},
				{ text: '动作', datafield: 'action', width: 45}
			],
			create_form: function(table_id){
				new_input(table_id, '分类标签：', '#posi_tags', 400, this.elemHeight);
				new_dropdown_strarr(table_id, 'URL正则：', '#posi_urls', 400, this.elemHeight, '请添加URL正则表达式：');
				new_dropdown_strarr(table_id, '定位选择器：', '#posi_selectors', 400, this.elemHeight, '请添加选择器：');
				new_dropdown(table_id, '插入位置', '#posi_insert', 120, this.elemHeight, source_insert_cn, 0);
				new_dropdown(table_id, '执行动作', '#posi_action', 120, this.elemHeight, source_action_cn, 0);
			},
			fill_form : function(data_record) {
				fill_input('#posi_tags', data_record, 'tags');
				fill_dropdown_strarr('#posi_urls', data_record, 'urls');
				fill_dropdown_strarr('#posi_selectors', data_record, 'selectors');
				fill_dropdown('#posi_insert', data_record, 'insert', source_insert_cn);
				fill_dropdown('#posi_action', data_record, 'action', source_action_cn);
			},
			extra_form : function () {
				var new_raw = {};
				extra_input(new_raw, '#posi_tags', 'tags');
				extra_dropdown(new_raw, '#posi_urls', 'urls');
				extra_dropdown(new_raw, '#posi_selectors', 'selectors');
				extra_dropdown(new_raw, '#posi_insert', 'insert');
				extra_dropdown(new_raw, '#posi_action', 'action');
				return new_raw;
			}
		};

		/**********************************
		账户识别库 UI代码
		**********************************/

		var identify_lst_data = {
			editrow : -1,
			elemHeight : 23,
			popHeight : 350,
			popWidth : 550,
			list_name : 'identify',
			container_id: '#tab_identify',
			data_fields : [
				{name: 'name', type: 'string'},
				{name: 'active', type: 'string'},
				{name: 'platform', type: 'string'},
				{name: 'caption', type: 'string'},
				{name: 'host', type: 'string'},
				{name: 'username-selector', type: 'string'},
				{name: 'username-revisor', type: 'string'},
				{name: 'nickname-selector', type: 'string'},
				{name: 'nickname-revisor', type: 'string'}
			],
			data_columns : [
				{ text: '规则名称', datafield: 'name', width: 80},
				{ text: '激活', datafield: 'active', width: 32},
				{ text: '系统标识', datafield: 'platform', width: 80},
				{ text: '系统名称', datafield: 'caption', width: 80},
				{ text: '主机名称正则', datafield: 'host', width: 100},
				{ text: '用户名选择器',  datafield: 'username-selector', width: 146},
				{ text: '用户名修正',  datafield: 'username-revisor', width: 146},
				{ text: '昵称选择器',  datafield: 'nickname-selector', width: 146},
				{ text: '昵称修正',  datafield: 'nickname-revisor', width: 146}
			],
			create_form: function(table_id){
				new_dropdown(table_id, '激活：', '#id_active', 200, this.elemHeight, source_active_cn, 0);
				new_combobox(table_id, '账户系统标识', '#id_platform', 200, this.elemHeight, []);
				new_combobox(table_id, '账户系统名称', '#id_caption', 200, this.elemHeight, []);
				new_combobox(table_id, '主机名称正则', '#id_host', 200, this.elemHeight, []);
				new_input(table_id, '用户名选择器：', "#id_user_selector", 400, this.elemHeight);
				new_input(table_id, '用户名修正：', "#id_user_revisor", 400, this.elemHeight);
				new_input(table_id, '昵称选择器：', "#id_nick_selector", 400, this.elemHeight);
				new_input(table_id, '昵称修正：', "#id_nick_revisor", 400, this.elemHeight);
			},
			fill_form : function(data_record) {
				fill_dropdown('#id_active', data_record, 'active', source_active_cn, 0);
				fill_combobox('#id_platform', data_record, 'platform');
				fill_combobox('#id_caption', data_record, 'caption');
				fill_combobox('#id_host', data_record, 'host');
				fill_input('#id_user_selector', data_record, 'username-selector');
				fill_input('#id_user_revisor', data_record, 'username-revisor');
				fill_input('#id_nick_selector', data_record, 'nickname-selector');
				fill_input('#id_nick_revisor', data_record, 'nickname-revisor');
			},
			extra_form : function () {
				var new_raw = {};
				extra_dropdown(new_raw, '#id_active', 'active');
				extra_combobox(new_raw, '#id_platform', 'platform');
				extra_combobox(new_raw, '#id_caption', 'caption');
				extra_combobox(new_raw, '#id_host', 'host');
				extra_input(new_raw, '#id_user_selector', 'username-selector');
				extra_input(new_raw, '#id_user_revisor', 'username-revisor');
				extra_input(new_raw, '#id_nick_selector', 'nickname-selector');
				extra_input(new_raw, '#id_nick_revisor', 'nickname-revisor');
				return new_raw;
			}
		};


		init_grid(popup_lst_data);
		init_grid(replace_lst_data);
		init_grid(userlst_data);
		init_grid(msg_lst_data);
		init_grid(posi_lst_data);
		init_grid(identify_lst_data);

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


			//数据定义完毕，下面是定义ui控件
			p.add_button_id = p.container_id + '_add_button';
			p.del_button_id = p.container_id + '_delete_button';
			p.update_button_id = p.container_id + '_update_button';
			p.grid_id = get_grid_id(p.container_id);
			p.pop_win_id = p.container_id + '_popup_window';
			p.table_id = p.container_id + '_inputtable';
			p.name_field_id = p.container_id + '_inputname';
			p.save_id = p.container_id + '_save_id';
			p.cancel_id = p.container_id + '_cancel_id';

			var html = [
				'<div style="margin-right: 5px; float: right;">',
					'<input id="'+rm_tagid(p.add_button_id)+'" type="button" value="添加" />',
					'<input id="'+rm_tagid(p.update_button_id)+'" type="button" value="修改" />',
					'<input id="'+rm_tagid(p.del_button_id)+'" type="button" value="删除" />',
				'</div>',
				'<div id="'+rm_tagid(p.grid_id)+'"></div>',
				'<div id="'+rm_tagid(p.pop_win_id)+'">',
					'<div>编辑列表记录</div>',
					'<div style="overflow: hidden;">',
					'<table id="'+rm_tagid(p.table_id)+'">',
					'</table>',
					'</div>',
				'</div>'].join('');
			$(p.container_id).append(html);

			$(p.grid_id).jqxGrid({
				source: dataAdapter,
				theme: theme,
				sortable: true,
				width: '100%',
				enableellipsis: false,
				enableanimations: false,
				enablehover: false,
				autoheight: true,
				autorowheight: true,
				columns: p.data_columns
			});

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
				maxHeight: 800,
				height: p.popHeight, 
				width: p.popWidth,
				resizable: false, 
				theme: theme, 
				isModal: true, 
				autoOpen: false, 
				modalOpacity: 0.01           
			});

			new_input(p.table_id, '名称：', p.name_field_id, 200, p.elemHeight);
			p.create_form(p.table_id);

			var html = '<tr><td align="right"></td>';
			html += '<td style="padding-top: 10px;" align="right">';
			html += '<input id="'+rm_tagid(p.save_id)+'" style="margin-right: 5px;" type="button" value="保存" />';
			html += '<input id="'+rm_tagid(p.cancel_id)+'" type="button" value="取消" /></td></tr>';
			$(p.table_id).append(html);

			$(p.cancel_id).jqxButton({width: 76, height:40, theme: theme });
			$(p.cancel_id).click(function () {
				$(p.pop_win_id).jqxWindow('hide');
			});
			$(p.save_id).jqxButton({width: 100, height:40, theme: theme });
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

	function new_dropdown(table_id, title, drop_id, width, height, source_cn, index) 
	{
		var html = '<tr><td align="right">'+title+'</td>';
		html += '<td align="left">';
		html += '<div id="'+rm_tagid(drop_id)+'"></div>';
		html += '</td></tr>';
		$(table_id).append(html);
		$(drop_id).jqxDropDownList({source:source_cn, selectedIndex:index,
			width: width, height: height, theme: theme,autoDropDownHeight:true});
	}

	function fill_dropdown(drop_id, data_record, name, list, init_index, ext_list)
	{
		if (data_record == null) {return;}
		if (typeof init_index !== 'undefined') {
			init_property(data_record, name, list[init_index]);
		}

		if (ext_list != null) {
			var new_list = $.merge($.merge([], list), ext_list);
			$(drop_id).jqxDropDownList({source: new_list});
		}

		if (data_record.hasOwnProperty(name)) {
			$(drop_id).jqxDropDownList('val', data_record[name]); 
		}
	}

	function extra_dropdown(extra_to, drop_id, name, filter)
	{
		var value = $(drop_id).jqxDropDownList('val'); 
		if (typeof filter === 'function') {
			value = filter(value);
		}
		extra_to[name] = value;
	}

	function new_dropdown_strarr(table_id, title, drop_id, width, height, tips) 
	{
		var btnid = drop_id+'_btn';
		var inputid = drop_id+'_input';
		var drop_len = 400/2;
		var btn_len = 40;
		var input_len = 400 - drop_len - btn_len - 2;

		var html = '<tr><td align="right">'+title+'</td>';
		html += '<td align="left">';
		html += '<div id="'+rm_tagid(drop_id)+'" style="float: left;"></div>';
		html += '<input type="button" value="添加" id="'+rm_tagid(btnid)+'" style="float: left;"/>';
		html += '<input type="text" id="'+rm_tagid(inputid)+'" style="float: left;" /></td></tr>';
		$(table_id).append(html);

		var range_opt = {height: height, theme: theme, placeHolder:tips, checkboxes:true, selectedIndex:0, width: drop_len};
		var btn_opt = {theme: theme, width: btn_len, height: height+2};

		$(drop_id).jqxDropDownList($.extend({source:[]}, range_opt));
		$(btnid).jqxButton(btn_opt);
		$(inputid).jqxInput({theme: theme, width: input_len, height: height});

		$(drop_id).on('checkChange', function (event) {
			var args = event.args;
			if (args) {
				var items = $(drop_id).jqxDropDownList('getItems'); 
				var input_val = $(inputid).val();

				var in_items = false;
				if (input_val === '') {
					in_items = true;
				} else {
					for(var index in items) {
						var item = items[index];
						if (item.value == args.item.value) {
							in_items = true;
							break;
						}
					}
				}

				if (in_items) {
					var item = args.item;
					$(inputid).val(item.value);
				}
			} 
		});

		$(btnid).on('click', function () {
			var value = $(inputid).val();
			var item = $(drop_id).jqxDropDownList('getItemByValue', value);
			if (item) {
				item.checked = true;
				return;
			}
			$(drop_id).jqxDropDownList('addItem', {value: value}); 
			item = $(drop_id).jqxDropDownList('getItemByValue', value);
			item.checked = true;
			$(drop_id).jqxDropDownList('selectItem', item ); 
		});

	}

	function fill_dropdown_strarr(drop_id, data_record, name) 
	{
		if (data_record == null) {return;}
		var d = drop_id;
		var inputid = drop_id+'_input';
		$(inputid).val('');
		$(d).jqxDropDownList('clear');
		if (!data_record.hasOwnProperty(name)) {
			return;
		}
		var val = data_record[name];
		if (val === '') {return;}
		var arr = val.split(',');
		$.each(arr, function() {
			$(d).jqxDropDownList('addItem', {value: this}); 
			var item = $(d).jqxDropDownList('getItemByValue', this);
			item.checked = true;
			$(d).jqxDropDownList('selectItem', item); 
		});
	}

	function new_number(table_id, title, id, width, height, symbol, min, init) {
		var html = '<tr><td align="right">'+title+'</td>';
		html += '<td align="left"><div id="'+rm_tagid(id)+'" /></td></tr>';
		$(table_id).append(html);
		$(id).jqxNumberInput({theme: theme,symbol:symbol,symbolPosition:'right',
			min:min,decimal:init,decimalDigits:0, 
			inputMode:'simple',spinButtons:true, width: width, height:height});
	}

	function fill_number(input_id, data_record, name, init)
	{
		if (data_record == null) {return;}
		init_property(data_record, name, init);
		if (data_record.hasOwnProperty(name)) {
			$(input_id).jqxNumberInput('setDecimal', data_record[name]);
		}
	}

	function extra_number(extra_to, tag_id, name) 
	{
		var value = $(tag_id).jqxNumberInput('getDecimal');
		extra_to[name] = value;
	}

	function new_datatime(table_id, title, id, width, height) 
	{
		var html = '<tr><td align="right">'+title+'</td>';
		html += '<td align="left"><div type="text" id="'+rm_tagid(id)+'" /></td></tr>';
		$(table_id).append(html);
		var date_opt = {culture:'zh-CN', formatString: 'F', theme:theme, width:200, height:this.elemHeight};
		$(id).jqxDateTimeInput(date_opt);
	}

	function fill_datetime(time_id, data_record, name)
	{
		if (data_record == null) {return;}
		if (data_record.hasOwnProperty(name)) {
			$(time_id).jqxDateTimeInput('setDate', data_record[name]);
		}
	}

	function extra_datetime(extra_to, time_id, name) 
	{
		var value = $(time_id).jqxDateTimeInput('getDate');
		extra_to[name] = value;
	}

	function new_input(table_id, title, id, width, height) {
		var html = '<tr><td align="right">'+title+'</td>';
		html += '<td align="left"><input type="text" id="'+rm_tagid(id)+'" /></td></tr>';
		$(table_id).append(html);
		$(id).jqxInput({theme: theme, width: width, height: height, source:[]});
	}

	function new_textarea(table_id, title, id, width, height) {
		var html = '<tr><td align="right">'+title+'</td>';
		html += '<td align="left"><textarea id="'+rm_tagid(id)+'"></textarea></td></tr>';
		$(table_id).append(html);
		$(id).jqxInput({theme: theme, width: width, height: height});
	}

	function fill_textarea(input_id, data_record, name, init)
	{
		if (data_record == null) {return;}
		return fill_input(input_id, data_record, name, init);
	}

	function extra_textarea(extra_to, input_id, name, filter) 
	{
		return extra_input(extra_to, input_id, name, filter);
	}

	function new_combobox(table_id, title, id, width, height, source_arr) 
	{
		var html = '<tr><td align="right">'+title+'</td>';
		html += '<td align="left"><div id="'+rm_tagid(id)+'" /></td></tr>';
		$(table_id).append(html);
		$(id).jqxComboBox({theme: theme,source: source_arr, selectedIndex:0, width: width, height: height});
	}

	function fill_combobox(input_id, data_record, name, init)
	{
		if (data_record == null) {return;}
		if (typeof init !== 'undefined') {
			init_property(data_record, name, init);
		}
		if (data_record.hasOwnProperty(name)) {
			$(input_id).jqxComboBox('val', data_record[name]);
		}
	}

	function extra_combobox(extra_to, input_id, name) {
		var value = $(input_id).jqxComboBox('val');
		extra_to[name] = value;
	}

	function fill_input(input_id, data_record, name, init)
	{
		if (data_record == null) {return;}
		if (typeof init !== 'undefined') {
			init_property(data_record, name, init);
		}
		if (data_record.hasOwnProperty(name)) {
			$(input_id).val(data_record[name]);
		}
	}

	function extra_input(extra_to, input_id, name, filter) 
	{
		var value = $(input_id).val();
		if (typeof filter === 'function') {
			value = filter(value);
		}
		extra_to[name] = value;
	}


	function rm_comma (d) {
		return d.replace(/,/g, '');
	}

	function rm_tagid(d) {
		return d.replace(/#/g, '');
	}

	function rm_space (d) {
		return d.replace(/(\r\n|\n|\r)/gm,"");
	}


	function add_value(list_str, value) {
		if (list_str == '') {
			return value;
		}
		var arr = list_str.split(',');
		if (arr.indexOf(value) === -1) {
			arr.push(value);
			return arr.join(',');
		}
		return list_str;
	}

	function del_value(list_str, value) {
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
	}

	function is_grid_name(grid_id, name) {
		var a = $(grid_id).jqxGrid('getrows');
		var found = false;
		$.each(a, function(index, value){
			if (value.name === name) {
				found = true;
				return false;
			}
		});
		return found;
	}

	function get_nametags(grid_id, filter) {
		var a = $(grid_id).jqxGrid('getrows');
		var tags = Array();
		var names = Array();

		var fn=function(d){return true;};
		if (typeof(filter) === 'function') {
			fn = filter;
		}

		$.each(a, function(index, value){
			if (!fn(value)) {
				return;
			}
			
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
		var all = $.extend([], tags, names);
		return Array(names, tags, all);
	}

	function fill_dropdown_button(drop_id, data_record, name)
	{
		if (data_record == null) {return;}
		if (data_record.hasOwnProperty(name)) {
			$(drop_id).jqxDropDownButton('setContent', data_record[name]);
		}
	}

	function extra_dropdown_button(extra_to, drop_id, name)
	{
		var value = $(drop_id).jqxDropDownButton('getContent');
		extra_to[name] = value;
	}

	function new_dropdown_grid(table_id, title, drop_id, tab_id, src_filter, width, height) 
	{
		var grid_id = drop_id + '_grid';
		var grid_src = get_grid_id(tab_id);
		$(table_id).append([
		'<tr>',
		  '<td align="right">'+title+'</td>',
		  '<td align="left">',
		    '<div id="'+rm_tagid(drop_id)+'">',
			'<div style="border: none;" id="'+rm_tagid(grid_id)+'"></div>',
		    '</div>',
		  '</td>',
		'</tr>'].join(''));
		$(drop_id).jqxDropDownButton({theme: theme, width: width, height: height});

		$(grid_id).jqxGrid({
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
			],
			source : new $.jqx.dataAdapter({
				localdata: [],
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
			})
		});

		$(drop_id).bind('open', function () { 
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

			var source = $(grid_id).jqxGrid('source');
			var items = get_nametags(grid_src, src_filter);
			var localdatas = make_array_data($.merge(items[1], items[0]));
			source._source.localdata = localdatas;
			source.dataBind();

			var new_val = [];
			var old_val = $(drop_id).jqxDropDownButton('getContent');
			var arr = old_val.split(',');
			$.each(arr, function(i, target) {
				$.each(localdatas, function(index, line) {
					var found = false;
					$.each(line, function(fieldname, value) {
						if (target == value) {
							$(grid_id).jqxGrid('selectcell', index, fieldname);
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
			$(grid_id).jqxGrid('clearselection');
			$(drop_id).jqxDropDownButton('setContent', old_val);
		});
		$(grid_id).on('cellselect', function (event) {
			var value = $(grid_id).jqxGrid('getcellvalue', event.args.rowindex, event.args.datafield);
			if (value == '') {return;} 
			var old_val = $(drop_id).jqxDropDownButton('getContent');
			var new_val = add_value(old_val, value);
			if (old_val === new_val) {return;}
			$(drop_id).jqxDropDownButton('setContent', new_val);
		});
		$(grid_id).on('cellunselect', function (event) {
			var value = $(grid_id).jqxGrid('getcellvalue', event.args.rowindex, event.args.datafield);
			if (value == '') {return;}; 
			var old_val = $(drop_id).jqxDropDownButton('getContent');
			var new_val = del_value(old_val, value);
			if (old_val === new_val) {return;}
			$(drop_id).jqxDropDownButton('setContent', new_val);
		});
	}

	function fill_dropdown_range(dropid, value) 
	{
		$(dropid).jqxDropDownList('clear');
		if ((value==='') || (value==='--')) {return;}
		if (value === undefined) {return;}
		var arr = value.split(',');
		$.each(arr, function() {
			$(dropid).jqxDropDownList('addItem', {value: this}); 
			item = $(dropid).jqxDropDownList('getItemByValue', this);
			item.checked = true;
			$(dropid).jqxDropDownList('selectItem', item); 
		});
	}

	function new_dropdown_range(table_id, title, dropid, width, height) 
	{
		var btnid = dropid+'_btn';
		var lowid = dropid+'_low';
		var highid = dropid+'_high';
		var btn_len = 40;
		var range_int_len = 60;
		var range_len = width - range_int_len*2 - btn_len -2;

		$(table_id).append([
		'<tr>',
		  '<td align="right">'+title+'</td>',
		  '<td align="left">',
		    '<div id="'+rm_tagid(dropid)+'" style="float: left;"></div>',
		    '<input type="button" value="Button" id="'+rm_tagid(btnid)+'" style="float: left;"/>',
		    '<div id="'+rm_tagid(lowid)+'" style="float: left;"></div>',
		    '<div id="'+rm_tagid(highid)+'" style="float: left;"></div>',
		  '</td>',
		'</tr>'].join(''));
		
		var range_opt = {height: height, theme: theme, placeHolder:'请添加区间：',
			checkboxes:true, selectedIndex:0, width: range_len};
		var rangeint_opt = {height: height, theme: theme, inputMode:'simple', 
			spinButtons:true, decimalDigits:0, width:range_int_len};
		var btn_opt = {theme: theme, width: btn_len, height: height+2};

		$(dropid).jqxDropDownList($.extend({source:[]}, range_opt));
		$(btnid).jqxButton(btn_opt);
		$(btnid).jqxButton('val', '添加');
		$(lowid).jqxNumberInput(rangeint_opt);
		$(highid).jqxNumberInput(rangeint_opt);

		$(btnid).on('click', function () {
			var min = $(lowid).jqxNumberInput('getDecimal');
			var max = $(highid).jqxNumberInput('getDecimal');
			if (min > max) {return;}
			var value = min+'-'+max;
			var item = $(dropid).jqxDropDownList('getItemByValue', value);
			if (item) {
				item.checked = true;
				return;
			}
			$(dropid).jqxDropDownList('addItem', {value: value}); 
			item = $(dropid).jqxDropDownList('getItemByValue', value);
			item.checked = true;
			$(dropid).jqxDropDownList('selectItem', item ); 
		});
	}

	function get_grid_id(container_id) {
		return container_id+'_jqxgrid_list';
	}
}

(function(a){function b(a,b){var c=(a&65535)+(b&65535),d=(a>>16)+(b>>16)+(c>>16);return d<<16|c&65535}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<a.length*32;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];c[(a.length>>2)-1]=undefined;for(b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<a.length*8;b+=8)c[b>>5]|=(a.charCodeAt(b/8)&255)<<b%32;return c}function l(a){return j(i(k(a),a.length*8))}function m(a,b){var c,d=k(a),e=[],f=[],g;e[15]=f[15]=undefined,d.length>16&&(d=i(d,a.length*8));for(c=0;c<16;c+=1)e[c]=d[c]^909522486,f[c]=d[c]^1549556828;return g=i(e.concat(k(b)),512+b.length*8),j(i(f.concat(g),640))}function n(a){var b="0123456789abcdef",c="",d,e;for(e=0;e<a.length;e+=1)d=a.charCodeAt(e),c+=b.charAt(d>>>4&15)+b.charAt(d&15);return c}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"use strict",typeof define=="function"&&define.amd?define(function(){return t}):a.md5=t})(this);

