function identify_init() { (function(){

var data = window.omp_global_data;

function main()
{
	data.get_posi = get_posi;
	data.get_containers = get_containers;
	data.run_identify = run_identify;
	data.show_containers = show_containers;

	//判断是不是ie
	data.msie = /msie/.test(navigator.userAgent.toLowerCase());
	//推送服务器地址，可以和管理服务器在不同的域名上
	data.push_server = 'dynamic.appgame.com';
	//推送模式优先级，一个不行会再试下一个，不过timeout时间似乎很长
	//window.push_modes = (msie)? 'stream|longpolling' : 'websocket|eventsource|longpolling|stream'; 
	data.push_modes = (data.msie)? 'stream' : 'websocket|eventsource|longpolling|stream'; 
	//推送模块日志显示级别
	data.push_loglevel = 'debug';


	init_css();
}

function run_identify(binder)
{
	binder(get_user_name());
	disqus_report(data.device, binder);
}

function init_css()
{
	var css_str = [
	"<style type='text/css'>",
		'.omp_replaced_hide_cmd,',
		'.omp_replaced_hide {',
			'display: none;',
		'}',
	'</style>'
	].join("\n");
	jQomp(css_str).appendTo('head');
}

function show_containers()
{
	var hiden_items = jQomp('.omp_replaced_hide');
	if (hiden_items.length >0) {
		console.log(hiden_items);
		hiden_items.removeClass('omp_replaced_hide');
	}
}

function get_containers()
{
	var result_obj = {};
        jQomp.each(posi_configs, function() {
		var url_matched = false;
		var config = this; 
		jQomp.each(config.urls, function() {
			var patt = new RegExp(this, 'i');
			if (patt.test(window.location.href)) {
				url_matched = true;
				return false;
			}
		});

		if (!url_matched) {
			return true;
		}

		var number = 0;
		jQomp.each(config.selectors, function() {
			var container = jQomp(this.toString());
			if (container.length == 0) {
				return true;
			}
			number += container.length;

			if (config.action !== 'none') {
				container.addClass('omp_replaced_hide');
			}
		});

		if (number) {
			result_obj[config.key] = number;
		}
	});
	return result_obj;
}

function get_posi(key)
{
	var found = null;
        jQomp.each(posi_configs, function() {
		if (this.key === key) {
			found = jQomp.extend({}, this);
			return false;
		}
	});
	return found;
}

function disqus_report(device, binder)
{
	var device_id = device;
	var disqus_thread = jQomp('div#disqus_thread');
	if (disqus_thread.length == 0) {
		return;
	}

    if (window.location.hostname.match(new RegExp("appgame.com", 'i'))) {
    	var req_url = "http://bbs.appgame.com/disqus_helper.php?action=disqus_auth&callback=?";
	jQomp.getJSON(req_url).success(function (d) {
		var remote_auth_s3 = d.remote_auth_s3;
		var userdata = remote_auth_s3.split(' ')[0];
		userdata = jQomp.base64.decode(userdata);
		userdata = jQomp.parseJSON(userdata);

		if (!userdata.username) {
			return;
		}

		var id_obj = {};
		id_obj['name'] = 'disqus';
		id_obj['caption'] = '评论';
		id_obj['username'] = userdata.username;
		id_obj['nickname'] = '';
		binder(id_obj);
	});
    }
}

function get_user_name()
{
    var id_obj = {};
    var travers_seletors = function(sel) {
        var result = '';
        jQomp.each(sel, function() {
            var target = jQomp(this.selector), text = '';
            if (target.length === 0) return true; //skip,

            if (this.hasOwnProperty('revisor') && typeof this.revisor === 'function') {
                text = this.revisor(target);
            } else {
                //text = target.text().trim(); //在ie下报错
                text = jQomp.trim(target.text());
            }

            result = text;
            return false; //break
        });
        return result;
    };

    if (typeof ident_configs === 'undefined') {
	    return id_obj;
    }

    jQomp.each(ident_configs, function() {
	var hostname = window.location.hostname;
	var right_host = false;
	jQomp.each(this.hosts, function() {
		if (hostname.match(new RegExp(this, 'i'))) {
			right_host = true;
			return false; //break
		}
	});

	if (!right_host) {
		return true; //continue
	}

        id_obj['name'] = this.name;
        id_obj['caption'] = this.caption;
        id_obj['username'] = travers_seletors(this.username);
        id_obj['nickname'] = travers_seletors(this.nickname);

        return false; //break
    });

    return id_obj;
}

//jquery.base64
"use strict";jQomp.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQomp));


var posi_configs = [
  {
    "key":"ea80d56aa59755ca57e5eba3c0a717cc",
    "urls":[
      "www.appgame.com.*html$"
    ],
    "selectors":[
      "img[src*='weixin-appgamecom-follow-us.jpg']"
    ],
    "insert":"after",
    "action":"none"
  },
  {
    "key":"318aca2992d0dcaf7caa96794031ef67",
    "urls":[
      "www.appgame.com"
    ],
    "selectors":[
      ".sidebar-widget:first"
    ],
    "insert":"before",
    "action":"none"
  },
  {
    "key":"71fb8016979552fba52a38e60f3b8988",
    "urls":[
      "www.appgame.com.*html$"
    ],
    "selectors":[
      ".ewt_newrat img[src*='ewt_rating']"
    ],
    "insert":"after",
    "action":"none"
  },
  {
    "key":"e9fd724dd6fa7e11e70b1d744b6d9e25",
    "urls":[
      "bbs.appgame.com.forum.*html$"
    ],
    "selectors":[
      ".bml img:first"
    ],
    "insert":"before",
    "action":"none"
  }
];

var ident_configs = [
  {
    "name":"bbs-appgame",
    "caption":"\u8bba\u575b",
    "hosts":[
      "bbs.appgame.com"
    ],
    "username":[
      {
        "selector":"div#um strong.vwmy a:first",
        "revisor":""
      }
    ],
    "nickname":[
      
    ]
  },
  {
    "name":"appgame",
    "caption":"\u4efb\u73a9\u5802",
    "hosts":[
      "appgame.com"
    ],
    "username":[
      {
        "selector":"a span.username",
        "revisor":""
      }
    ],
    "nickname":[
      {
        "selector":"a span.display-name",
        "revisor":""
      }
    ]
  }
];

main();})();}