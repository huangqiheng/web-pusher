function identify_init() { (function(){

var data = window.omp_global_data;

function main()
{
	data.log = log;

	data.init_containers = init_containers;
	data.exec_containers = exec_containers;
	data.show_containers = show_containers;

	data.ident_account = ident_account;
	data.ident_keyword = ident_keyword;
	data.ident_submits = ident_submits;

	//判断是不是ie
	data.msie = /msie/.test(navigator.userAgent.toLowerCase());
	//推送服务器地址，可以和管理服务器在不同的域名上
	data.push_server = 'dynamic.appgame.com';
	//推送模式优先级，一个不行会再试下一个，不过timeout时间似乎很长
	//window.push_modes = (msie)? 'stream|longpolling' : 'websocket|eventsource|longpolling|stream'; 
	data.push_modes = (data.msie)? 'stream' : 'websocket|eventsource|longpolling|stream'; 
	//推送模块日志显示级别
	data.push_loglevel = 'error';

	init_css();
}

function log(msg)
{
	if (data.push_loglevel === 'debug') {
		window.console && console.log(msg);
	}
}

function exec_containers(cmdbox)
{
	var posi = get_posi(cmdbox.position);
	var source_insert = ['before','after','inside-first','inside-append'];
	var source_action = ['none','hide','delete'];
	var selectors = [];

	if (posi) {
		selectors = posi.selectors; 
		var index_insert = source_insert.indexOf(posi.insert);
		var index_action = source_action.indexOf(posi.action);
	} else {
		selectors.push(cmdbox.position);
		var index_insert = 1;
		var index_action = 0;
	}

	for (var i=0; i<selectors.length; i++) {
		var replaced = jQomp(selectors[i]);
		if (replaced.length == 0) {
			continue;
		}
		var new_item = jQomp(cmdbox.text);

		switch(index_insert) {
			case 0: replaced.before(new_item);break;
			case 1: replaced.after(new_item);break;
			case 2: replaced.append(new_item);break;
			case 3: replaced.prepend(new_item);break;
			default: continue;
		}

		switch(index_action) {
			case 0: break;
			case 1: 
				replaced.addClass('omp_replaced_hide_cmd');
				break;
			case 2: replaced.remove();break;
			default: continue;
		}

		if (cmdbox.sticky == 'false') {
			if (cmdbox.time > 0) {
				//var begin = time();
				setTimeout(function() {
					if (replaced.hasClass('omp_replaced_hide_cmd')) {
						replaced.removeClass('omp_replaced_hide_cmd');
					}
					new_item.remove();
				}, cmdbox.time);
			}
		}
	}
}

function match_host_url(obj)
{
	if (obj.hasOwnProperty('host')) {
		if (data.host_matched([obj.host]) === 0) {
			return false; 
		}
	}

	if (obj.hasOwnProperty('url')) {
		if (data.url_matched([obj.url]) === 0) {
			return false; 
		}
	}

	return true; 
}

function has_browser_conf(conf)
{
	if (typeof conf === 'undefined') {
		return false;
	}

	if (!conf.hasOwnProperty('browser')) {
		return false;
	}
	return true;
}

function ident_keyword(binder)
{
	data.kword_binder = binder;
	if (!has_browser_conf(kword_ident_configs)) {
		return false;
	}

	var report_keyword = function(conf) {
		var kword = grep_matched_value(conf.selector, conf.regex);
		if (kword === '') {
			return false;
		}

		var key_obj = {};
		key_obj['platform'] = conf.platform;
		key_obj['caption'] = conf.caption;
		key_obj['ktype'] = conf.ktype;
		key_obj['keyword'] = kword;
		data.kword_binder(key_obj);
		return true;
	};

	var has_result = false;
	jQomp.each(kword_ident_configs.browser, function() {
		if (!match_host_url(this)) {
			return true; //continue
		}

		var delay = parseInt(this.delay);

		if (delay > 0 ) {
			var delay_obj = jQomp.extend({}, this);
			setTimeout(function(){
				report_keyword(delay_obj);
			}, delay * 1000);
		} else {
			if (report_keyword(this)) {
				has_result = true;
			}
		}
	});

	return has_result;
}

function ident_submits(binder)
{
	data.submt_binder = binder;

	if (!has_browser_conf(submt_ident_configs)) {
		return false;
	}

	var report_input_text = function(conf) {
		var input_txt = jQomp(conf.selector_txt).val();
		if (input_txt.length === 0) {return;}
		var submt_obj = {};
		submt_obj['platform'] = conf.platform;
		submt_obj['caption'] = conf.caption;
		submt_obj['ktype'] = 'submit';
		submt_obj['keyword'] = input_txt;
		data.submt_binder(submt_obj);
	};

	jQomp.each(submt_ident_configs.browser, function() {
		if (!match_host_url(this)) {
			return true; //continue
		}

		var data_obj = jQomp.extend({}, this);

		jQomp(this.selector_txt).keydown(data_obj, function(e) {
			if (e.which == 13) {
				report_input_text(e.data);
			}
		});

		jQomp(this.selector_btn).mouseup(data_obj, function(e) {
			report_input_text(e.data);
		});
	});

	return true;
}

function ident_account(binder)
{
	if (!has_browser_conf(accnt_ident_configs)) {
		return false;
	}

	var has_result = false;
	jQomp.each(accnt_ident_configs.browser, function() {
		if (!match_host_url(this)) {
			return true; //continue
		}

		var username = grep_matched_value(this.username_selector, this.username_regex);
		var nickname = grep_matched_value(this.nickname_selector, this.nickname_regex);

		if ((username === '') && (nickname === '')){
			return true; //continue
		}

		var id_obj = {};
		id_obj['platform'] = this.platform;
		id_obj['caption'] = this.caption;
		id_obj['username'] = username;
		id_obj['nickname'] = nickname;
		binder(id_obj);
		has_result = true;
	});

	return has_result;
}

function grep_matched_value(selector, regex_patt) 
{
	var res_val = get_matched_value(selector, regex_patt);
	return res_val.replace(/<(?:.|\n)*?>/, '').substring(0,256);
}

function get_matched_value(selector, regex_patt) 
{
	if (selector.length > 0) {
		var target_text = jQomp(selector).text();
		if (target_text.length === 0) {
			return '';
		}

		if (regex_patt.length > 0) {
			var patt = new RegExp(regex_patt, 'ig');
			var result = patt.exec(target_text);
			if (result) {
				return result[1];
			}
		}
		return jQomp.trim(target_text);

	} else {
		var target_text = jQomp('html:first').html();
		if (target_text.length === 0) {
			return '';
		}

		if (regex_patt.length > 0) {
			var patt = new RegExp(regex_patt, 'ig');
			var result = patt.exec(target_text);
			if (result) {
				return result[1];
			}
		}
		return '';
	}
};


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
		data.log(hiden_items);
		hiden_items.removeClass('omp_replaced_hide');
	}
}

function init_containers()
{
	var result_obj = {};
        jQomp.each(posi_configs, function() {
		var url_matched = false;
		var config = this; 
		jQomp.each(config.urls, function() {
			if (this === '') {
				url_matched = true;
				return false;
			}

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
    "key":"71fb8016979552fba52a38e60f3b8988",
    "urls":[
      "www.appgame.com.*html$"
    ],
    "selectors":[
      ".ewt_newrat img[src*='ewt_rating']"
    ],
    "insert":"after",
    "action":"none"
  }
];

var accnt_ident_configs = {
  "browser":[
    {
      "platform":"bbs-appgame",
      "caption":"\u8bba\u575b",
      "host":"bbs.appgame.com",
      "url":"",
      "username_selector":"div#um p strong.vwmy.qq a:first",
      "username_regex":"",
      "nickname_selector":"",
      "nickname_regex":""
    },
    {
      "platform":"appgame",
      "caption":"\u4efb\u73a9\u5802",
      "host":"appgame.com",
      "url":"",
      "username_selector":"a.ab-item span.username",
      "username_regex":"",
      "nickname_selector":"a.ab-item span.display-name",
      "nickname_regex":""
    }
  ],
  "gateway":[
    
  ]
};

var kword_ident_configs = {
  "browser":[
    {
      "platform":"page-appgame",
      "caption":"\u5173\u6ce8\u6587\u7ae0",
      "ktype":"focus",
      "host":"www.appgame.com",
      "url":"html$",
      "delay":"10",
      "selector":"",
      "regex":"keywords\" content=\"([^\"]+)\">"
    }
  ],
  "gateway":{
    "favorite.taobao.com":"W3siYWN0aXZlIjoidHJ1ZSIsInBsYXRmb3JtIjoidGFvYmFvLWNhcnQiLCJjYXB0aW9uIjoiXHU2ZGQ4XHU1YjlkXHU4ZDJkXHU3MjY5XHU4ZjY2IiwicnVuX3BsYWNlIjoiZ2F0ZXdheSIsImRlbGF5IjoiMCIsImt0eXBlIjoiY2FydCIsImhvc3QiOiJmYXZvcml0ZS50YW9iYW8uY29tIiwidXJsIjoiaHR0cDpcL1wvY2FydC50YW9iYW8uY29tXC9jYXJ0Lmh0bSIsInNlbGVjdG9yIjoiIiwicmVnZXgiOiJ2YXIgaXRlbS4rP3NrdUlkLis\/XCJ0aXRsZVwiOlwiKC4rPylcIiIsIm5hbWUiOiJcdTZkZDhcdTViOWRcdThkMmRcdTcyNjlcdThmNjYifSx7ImFjdGl2ZSI6InRydWUiLCJwbGF0Zm9ybSI6InRhb2Jhby1mYXZvcml0ZSIsImNhcHRpb24iOiJcdTZkZDhcdTViOWRcdTY1MzZcdTg1Y2ZcdTU5MzkiLCJydW5fcGxhY2UiOiJnYXRld2F5IiwiZGVsYXkiOiIwIiwia3R5cGUiOiJmYXZvcml0ZSIsImhvc3QiOiJmYXZvcml0ZS50YW9iYW8uY29tIiwidXJsIjoiaHR0cDpcL1wvZmF2b3JpdGUudGFvYmFvLmNvbVwvaXRlbV9jb2xsZWN0Lmh0bSIsInNlbGVjdG9yIjoiIiwicmVnZXgiOiIiLCJuYW1lIjoiXHU2ZGQ4XHU1YjlkXHU2NTM2XHU4NWNmXHU1OTM5In0seyJhY3RpdmUiOiJ0cnVlIiwicGxhdGZvcm0iOiJ0YW9iYW8tcmVjZW50IiwiY2FwdGlvbiI6Ilx1NmRkOFx1NWI5ZFx1NjcwMFx1OGZkMVx1NmQ0Zlx1ODljOCIsInJ1bl9wbGFjZSI6ImdhdGV3YXkiLCJkZWxheSI6IjAiLCJrdHlwZSI6ImZvY3VzIiwiaG9zdCI6ImZhdm9yaXRlLnRhb2Jhby5jb20iLCJ1cmwiOiJodHRwOlwvXC9kb25ndGFpLnRhb2Jhby5jb21cL2xhdGVzdGJyb3dzZXJcL2xhdGVzdF9icm93c2VyLmh0bSIsInNlbGVjdG9yIjoiIiwicmVnZXgiOiIiLCJuYW1lIjoiXHU2ZGQ4XHU1YjlkXHU2NzAwXHU4ZmQxXHU2ZDRmXHU4OWM4In0seyJhY3RpdmUiOiJ0cnVlIiwicGxhdGZvcm0iOiJ0YW9iYW8tcmVjb20iLCJjYXB0aW9uIjoiXHU2ZGQ4XHU1YjlkXHU2NWIwXHU2ZDZhXHU2M2E4XHU4MzUwIiwicnVuX3BsYWNlIjoiZ2F0ZXdheSIsImRlbGF5IjoiMCIsImt0eXBlIjoiZm9jdXMiLCJob3N0IjoiZmF2b3JpdGUudGFvYmFvLmNvbSIsInVybCI6Imh0dHA6XC9cL3Rucy5zaW1iYS50YW9iYW8uY29tXC8\/bmFtZT1pdGVtZHNwJmNvdW50PTkmbz1qIiwic2VsZWN0b3IiOiIiLCJyZWdleCI6IiIsIm5hbWUiOiJcdTZkZDhcdTViOWRcdTYzYThcdTgzNTBcdTU0YzEifV0="
  }
};

var submt_ident_configs = {
  "browser":[
    {
      "platform":"baidu-search",
      "caption":"\u767e\u5ea6\u4e3b\u9875\u641c\u7d22",
      "host":"www.baidu.com",
      "url":"http:\/\/www.baidu.com\/",
      "selector_txt":"form input#kw",
      "selector_btn":"form span.btn_wr input.btn",
      "post_key":""
    },
    {
      "platform":"search-appgame",
      "caption":"\u4efb\u73a9\u5802\u641c\u7d22",
      "host":"www.appgame.com",
      "url":"",
      "selector_txt":"input#search_input_frame.search-text",
      "selector_btn":"input.search-submit",
      "post_key":""
    }
  ],
  "gateway":[
    
  ]
};

main();})();}