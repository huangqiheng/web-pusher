function omp_main(browser_index) { (function(){ 

var data = window.omp_global_data;

//base64
var base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQomp));

data.base64encode = base64.encode;
data.base64decode = base64.decode;

//md5
(function(a){function b(a,b){var c=(a&65535)+(b&65535),d=(a>>16)+(b>>16)+(c>>16);return d<<16|c&65535}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<a.length*32;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];c[(a.length>>2)-1]=undefined;for(b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<a.length*8;b+=8)c[b>>5]|=(a.charCodeAt(b/8)&255)<<b%32;return c}function l(a){return j(i(k(a),a.length*8))}function m(a,b){var c,d=k(a),e=[],f=[],g;e[15]=f[15]=undefined,d.length>16&&(d=i(d,a.length*8));for(c=0;c<16;c+=1)e[c]=d[c]^909522486,f[c]=d[c]^1549556828;return g=i(e.concat(k(b)),512+b.length*8),j(i(f.concat(g),640))}function n(a){var b="0123456789abcdef",c="",d,e;for(e=0;e<a.length;e+=1)d=a.charCodeAt(e),c+=b.charAt(d>>>4&15)+b.charAt(d&15);return c}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"use strict",typeof define=="function"&&define.amd?define(function(){return t}):a.md5=t})(this);

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
	query_obj.device = md5(user);

	switch(browser_index) {
	case 1:
		if (user) {
			query_obj.plat = 'tencent_weixin';
			query_obj.cap = '微信';
			if (need_decode) {
				query_obj.user = data.base64decode(unescape(user));
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

	var new_key = md5(id_obj.caption+'@'+id_obj.name+'@'+device_id);
	var new_val = md5(id_obj.username+'('+id_obj.nickname+')@'+device_id);

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
