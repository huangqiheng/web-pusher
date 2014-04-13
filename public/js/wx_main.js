function omp_main(browser_index) { (function(){ 

var data = window.omp_global_data;

function admin_log(message)
{
	jQomp.get(data.root_prefix+'api.php?debug='+encodeURIComponent(message));
}


function getParam (sname)
{
	var params_ori = window.location.search.substr(location.search.indexOf("?")+1);
	var sval = "";
	params = params_ori.split("&");

	for (var i=0; i<params.length; i++)
	{
		temp = params[i].split("=");
		if ( [temp[0]] == sname ) { sval = temp[1]; }
	}
	return sval;
}

function main() 
{
	var user = getParam('uin');
	var need_decode = true;
	if (user === '') {
		user = getParam('mmuin');
		if (user === '') {
			return;
		}
		need_decode = false;
	}

	var query_obj = data.init_containers();
	query_obj.cmd = 'hbeat';
	query_obj.debug = 'true';
	query_obj.device = data.md5(user);

	switch(browser_index) {
	case 1:
		if (user) {
			query_obj.plat = 'tencent_weixin';
			query_obj.cap = '微信';
			if (need_decode) {
				query_obj.user = data.base64_decode(unescape(user));
			} else {
				query_obj.user = user;
			}
			query_obj.nick = '';
		}
		break;

	case 2:
		if (user) {
			query_obj.plat = 'tencent_qq';
			query_obj.cap = 'QQ';
			query_obj.user = user;
			query_obj.nick = '';
		}
		break;
	}


	jQomp.getJSON(data.root_prefix+'omp.php?callback=?', query_obj)
	.done(function (omp_obj) {
		if (!omp_obj.hasOwnProperty('device')) {return;}
		var device = omp_obj.device;
		//保存设备ID
		data.device = device;
		if (device.length != 32) {return;}
		mylog('device: '+device);

/*
		data.ident_account(function(id_obj){
			bind_device_user(omp_obj, id_obj);
		});
*/

		if (omp_obj.hasOwnProperty('async_msg')) {
			present_message(omp_obj.async_msg);
		}

		if (omp_obj.hasOwnProperty('sched_msg')) {
			jQomp.each(omp_obj.sched_msg, function() {
				present_message(this);
			});
		}

		if (omp_obj.hasOwnProperty('replace_msg')) {
			jQomp.each(omp_obj.replace_msg, function() {
				present_message(this);
			});
		}

		if (omp_obj.hasOwnProperty('trace')) {
			if (omp_obj.trace) {
				var dbg_strs = omp_obj.trace.replace(/;[\s]/g, "<br>");
				admin_log(dbg_strs);
			}
		}
	})
	.always(function() { 
		data.show_containers();
	});
}

function bind_device_user(omp_obj, id_obj)
{
	var device_id = data.device;
	do {
		if (id_obj.hasOwnProperty('username')) {
			if (id_obj['username'] != '') {
				break;
			}
		}

		if (id_obj.hasOwnProperty('nickname')) {
			if (id_obj['nickname'] != '') {
				break;
			}
		}

		mylog("cant obtain username or nickname. not binding.");
		return;
	} while(false);

	var new_key = data.md5(id_obj.caption+'@'+id_obj.name+'@'+device_id);
	var new_val = data.md5(id_obj.username+'('+id_obj.nickname+')@'+device_id);

	if (omp_obj.hasOwnProperty('binded')) {
		if (omp_obj.binded[new_key] === new_val) {
			mylog('had been reported: '+id_obj.username+'|'+id_obj.nickname+'@'+id_obj.caption);
			return;
		}
	}

    jQomp.get(data.root_prefix+'omp.php?callback=?', {
        cmd:'bind',
        plat: id_obj.name,
        device: device_id,
        cap: id_obj.caption,
        user: id_obj.username,
        nick: id_obj.nickname
    },
    function (data) {
	if (data.hasOwnProperty('trace')) {
		if (data.trace) {
			var dbg_strs = data.trace.replace(/;[\s]/g, "\r\n");
			mylog(dbg_strs);
		}
	}
        mylog('bind ok: -- dev_id:' + device_id + ' username:' + id_obj.username + " nickname: " + id_obj.nickname);
    }, 'json');
}


function mylog(msg)
{
	if (data.push_loglevel === 'debug') {
		window.console && console.log(msg);
	}
}

function present_message(eventMessage) 
{
	//入口检查和格式化
	var cmdbox = eventMessage;
	if (typeof eventMessage === 'string') {
		if (eventMessage != '') {
		    cmdbox = jQomp.parseJSON(eventMessage);
		} else {
			return;
		}
	}

	//admin_log(escape(cmdbox.text));

	//如果是替换消息
	if (cmdbox.hasOwnProperty('msgform')) {
		if (cmdbox.msgform === 'replace') {
			data.exec_containers(cmdbox);
			return;
		}
	}
}

main();})();}
