function omp_main() { (function(){ 

function main() 
{
	var data = window.omp_global_data;

	jQomp.getJSON(data.root_prefix+'omp.php?cmd=hbeat&callback=?').success(function(omp_obj){
		if (!omp_obj.hasOwnProperty('device')) {return;}
		var device = omp_obj.device;
		//保存设备ID
		data.device = device;
		if (device.length != 32) {return;}

		push_routine(device); 
		identify_init(function(id_obj){
			bind_device_user(omp_obj, id_obj);
		});

		if (omp_obj.hasOwnProperty('async_msg')) {
			present_message(omp_obj.async_msg);
		}

		if (omp_obj.hasOwnProperty('sched_msg')) {
			jQomp.each(omp_obj.sched_msg, function() {
				present_message(this);
			});
		}

		if (omp_obj.hasOwnProperty('trace')) {
			if (omp_obj.trace) {
				var dbg_strs = omp_obj.trace.replace(/;[\s]/g, "\r\n");
				mylog(dbg_strs);
			}
		}
     });
}

function bind_device_user(omp_obj, id_obj)
{
	var data = window.omp_global_data;
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

	var new_key = md5(id_obj.caption+'@'+id_obj.name+'@'+device_id);
	var new_val = md5(id_obj.username+'('+id_obj.nickname+')@'+device_id);

	if (omp_obj.hasOwnProperty('binded')) {
		if (omp_obj.binded[new_key] === new_val) {
			mylog('had been reported');
			return;
		}
	}

    jQomp.post(data.root_prefix+'omp.php?callback=?', {
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
    },
	'json');
}


function mylog(msg)
{
	var data = window.omp_global_data;
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

	//如果是替换消息
	if (cmdbox.hasOwnProperty('msgform')) {
		if (cmdbox.msgform === 'replace') {
			execute_replace_message(cmdbox);
			return;
		}
	}

	//默认就当成是弹出消息
	execute_popup_message(cmdbox);
}

function execute_replace_message(cmdbox)
{
	var replaced = jQomp(cmdbox.position);
	var new_item = jQomp(cmdbox.text);
	//var begin = time();

	if (replaced.length == 0) {

	}

	replaced.css('display', 'none');
	replaced.after(new_item);

	if (cmdbox.time > 0) {
		setTimeout(function() {
			replaced.css('display', 'block');
			new_item.css('display', 'none');
		}, cmdbox.time);
	}
}

function execute_popup_message(cmdbox)
{
	jQomp.extend(jQomp.gritter.options, { 
		position: cmdbox.position
	});

	jQomp.gritter.add({
		title: cmdbox.title,
		text: cmdbox.text,
		time: cmdbox.time,
		sticky: cmdbox.sticky==='true',
		before_open: function(){
			do {
				if (!(cmdbox.before_open==true)) break;
				if (!document.hasFocus()) break;
				alert('有新消息到来');
			} while (false);
		}
	});
}

function push_routine(device_id) 
{
    var data = window.omp_global_data;
    PushStream.LOG_LEVEL = data.push_loglevel;

    var pushstream = new PushStream({
	host: data.push_server,
        port: window.location.port,
        modes: data.push_modes
    });

    pushstream.onmessage = present_message;

    pushstream.onstatuschange = function (state) {
	mylog((state == PushStream.OPEN)? 'omp online now' : 'omp offline now');
    };

	//后面代码，ie在bbs有兼容问题，发帖后显示内部错误
	//暂时先忽略ie
    if (/msie/.test(navigator.userAgent.toLowerCase())) {
	    return;
    }

    (function (channel) {
        pushstream.removeAllChannels();
        try {
            pushstream.addChannel(channel);
            pushstream.connect();
        } catch(e) {mylog(e)};
    })(device_id);
}



//md5
(function(a){function b(a,b){var c=(a&65535)+(b&65535),d=(a>>16)+(b>>16)+(c>>16);return d<<16|c&65535}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<a.length*32;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];c[(a.length>>2)-1]=undefined;for(b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<a.length*8;b+=8)c[b>>5]|=(a.charCodeAt(b/8)&255)<<b%32;return c}function l(a){return j(i(k(a),a.length*8))}function m(a,b){var c,d=k(a),e=[],f=[],g;e[15]=f[15]=undefined,d.length>16&&(d=i(d,a.length*8));for(c=0;c<16;c+=1)e[c]=d[c]^909522486,f[c]=d[c]^1549556828;return g=i(e.concat(k(b)),512+b.length*8),j(i(f.concat(g),640))}function n(a){var b="0123456789abcdef",c="",d,e;for(e=0;e<a.length;e+=1)d=a.charCodeAt(e),c+=b.charAt(d>>>4&15)+b.charAt(d&15);return c}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"use strict",typeof define=="function"&&define.amd?define(function(){return t}):a.md5=t})(this);


main();})();}
