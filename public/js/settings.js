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

	data.base64_encode = base64_encode;
	data.base64_decode = base64_decode;
	data.parse_url = parse_url;
	data.rawurldecode = rawurldecode;
	data.rawurlencode = rawurlencode;

	data.crc32 = crc32;
	data.utf8_encode = utf8_encode;
	data.utf8_decode = utf8_decode;
	data.md5 = md5;

	data.json_decode = json_decode;
	data.json_encode = json_encode;
	data.json_last_error = json_last_error;

	data.set_cookie = set_cookie;
	data.get_cookie = get_cookie;
	data.que_cookie = que_cookie;

	data.msie = /msie/.test(navigator.userAgent.toLowerCase());
	data.push_server = data.self_host;
	data.push_modes = (data.msie)? 'stream' : 'websocket|eventsource|longpolling|stream'; 
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

function kword_formater(kword)
{
	var kword_arr = kword.split(',');
	var title = document.title;
	var result = [];
	for(var i=0; i<kword_arr.length; i++) {
		var word = kword_arr[i].trim();
		if (title.indexOf(word) !== -1) {
			result.push(word);
		}
	}
	return result;
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

		if (conf.formater !== '') {
			var conf_formater = eval('('+conf.formater+')');
			kword = conf_formater(kword);
		} else {
			kword = kword_formater(kword);
		}

		var key_obj = {};
		key_obj['ktype'] = conf.ktype;
		key_obj['caption'] = conf.caption;
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
				return jQomp.trim(result[1]);
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
				return jQomp.trim(result[1]);
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

function set_cookie(cname,cvalue,seconds)
{
	var d = new Date();
	d.setTime(d.getTime()+(seconds*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function get_cookie(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) 
	{
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}

function que_cookie(obj, ttl)
{
	ttl = ttl || 300;
	var coded = json_encode(obj);
	var msg_block = rawurlencode(coded);
	var cookie_name = 'device_msg';
	var cookval = get_cookie(cookie_name);
	if (cookval === '') {
		cookval = msg_block;
	} else {
		cookval = cookval + ','+ msg_block;
	}
	set_cookie(cookie_name, cookval, ttl);
}

function json_last_error () {
	/*
	   JSON_ERROR_NONE = 0
	   JSON_ERROR_DEPTH = 1 // max depth limit to be removed per PHP comments in json.c (not possible in JS?)
	   JSON_ERROR_STATE_MISMATCH = 2 // internal use? also not documented
	   JSON_ERROR_CTRL_CHAR = 3 // [\u0000-\u0008\u000B-\u000C\u000E-\u001F] if used directly within json_decode(),
	   JSON_ERROR_SYNTAX = 4
	 */
	return this.php_js && this.php_js.last_error_json ? this.php_js.last_error_json : 0;
}

function json_encode (mixed_val) 
{
	// *        example 1: json_encode(['e', {pluribus: 'unum'}]);
	// *        returns 1: '[\n    "e",\n    {\n    "pluribus": "unum"\n}\n]'
	var retVal, json = this.window.JSON;
	try {
		if (typeof json === 'object' && typeof json.stringify === 'function') {
			retVal = json.stringify(mixed_val); // Errors will not be caught here if our own equivalent to resource
			//  (an instance of PHPJS_Resource) is used
			if (retVal === undefined) {
				throw new SyntaxError('json_encode');
			}
			return retVal;
		}

		var value = mixed_val;
		var quote = function (string) {
			var escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			var meta = { // table of character substitutions
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"': '\\"',
				'\\': '\\\\'
			};

			escapable.lastIndex = 0;
			return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
					var c = meta[a];
					return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' : '"' + string + '"';
		};

		var str = function (key, holder) {
			var gap = '';
			var indent = '    ';
			var i = 0; // The loop counter.
			var k = ''; // The member key.
			var v = ''; // The member value.
			var length = 0;
			var mind = gap;
			var partial = [];
			var value = holder[key];

			// If the value has a toJSON method, call it to obtain a replacement value.
			if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
				value = value.toJSON(key);
			}

			// What happens next depends on the value's type.
			switch (typeof value) {
				case 'string':
					return quote(value);

				case 'number':
					return isFinite(value) ? String(value) : 'null';

				case 'boolean':
				case 'null':
					return String(value);

				case 'object':
					if (!value) {
						return 'null';
					}
					if ((this.PHPJS_Resource && value instanceof this.PHPJS_Resource) || (window.PHPJS_Resource && value instanceof window.PHPJS_Resource)) {
						throw new SyntaxError('json_encode');
					}
					gap += indent;
					partial = [];
					if (Object.prototype.toString.apply(value) === '[object Array]') {
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || 'null';
						}
						v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n'+gap)+'\n'+mind+']' : '['+partial.join(',')+']';
						gap = mind;
						return v;
					}

					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
					v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
					gap = mind;
					return v;
				case 'undefined': // Fall-through
				case 'function': // Fall-through
				default: throw new SyntaxError('json_encode');
			}
		};
		return str('', {'': value});

	} catch (err) { // Todo: ensure error handling above throws a SyntaxError in all cases where it could
		if (!(err instanceof SyntaxError)) {
			throw new Error('Unexpected error type in json_encode()');
		}
		this.php_js = this.php_js || {};
		this.php_js.last_error_json = 4; // usable by json_last_error()
		return null;
	}
}

function json_decode (str_json) 
{
	// *        example 1: json_decode('[\n    "e",\n    {\n    "pluribus": "unum"\n}\n]');
	// *        returns 1: ['e', {pluribus: 'unum'}]
	var json = this.window.JSON;
	if (typeof json === 'object' && typeof json.parse === 'function') {
		try {
			return json.parse(str_json);
		} catch (err) {
			if (!(err instanceof SyntaxError)) {
				throw new Error('Unexpected error type in json_decode()');
			}
			this.php_js = this.php_js || {};
			this.php_js.last_error_json = 4; // usable by json_last_error()
			return null;
		}
	}

	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	var j;
	var text = str_json;

	cx.lastIndex = 0;
	if (cx.test(text)) {
		text = text.replace(cx, function (a) {
				return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
	}

	if ((/^[\],:{}\s]*$/).
			test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
			replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
			replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
		j = eval('(' + text + ')');
		return j;
	}

	this.php_js = this.php_js || {};
	this.php_js.last_error_json = 4; // usable by json_last_error()
	return null;
}

function base64_decode (data) 
{
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    dec = "",
	    tmp_arr = [];

	if (!data) {
		return data;
	}

	data += '';
	do { // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;

		if (h3 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1);
		} else if (h4 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1, o2);
		} else {
			tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		}
	} while (i < data.length);
	dec = tmp_arr.join('');
	return dec;
}

function base64_encode (data) 
{
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    enc = "",
	    tmp_arr = [];

	if (!data) {
		return data;
	}

	do { // pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);

		bits = o1 << 16 | o2 << 8 | o3;

		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;

		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);

	enc = tmp_arr.join('');
	var r = data.length % 3;
	return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}


function crc32 (str) 
{
	// *     example 1: crc32('Kevin van Zonneveld');
	// *     returns 1: 1249991249
	str = utf8_encode(str);
	var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

	var crc = 0;
	var x = 0;
	var y = 0;
	crc = crc ^ (-1);
	for (var i = 0, iTop = str.length; i < iTop; i++) {
		y = (crc ^ str.charCodeAt(i)) & 0xFF;
		x = "0x" + table.substr(y * 9, 8);
		crc = (crc >>> 8) ^ x;
	}
	return crc ^ (-1);
}

function utf8_decode (str_data) {
	// *     example 1: utf8_decode('Kevin van Zonneveld');
	// *     returns 1: 'Kevin van Zonneveld'
	var tmp_arr = [],
	    i = 0,
	    ac = 0,
	    c1 = 0,
	    c2 = 0,
	    c3 = 0,
	    c4 = 0;

	str_data += '';

	while (i < str_data.length) {
		c1 = str_data.charCodeAt(i);
		if (c1 <= 191) {
			tmp_arr[ac++] = String.fromCharCode(c1);
			i++;
		} else if (c1 <= 223) {
			c2 = str_data.charCodeAt(i + 1);
			tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
			i += 2;
		} else if (c1 <= 239) {
			// http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
			c2 = str_data.charCodeAt(i + 1);
			c3 = str_data.charCodeAt(i + 2);
			tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
		} else {
			c2 = str_data.charCodeAt(i + 1);
			c3 = str_data.charCodeAt(i + 2);
			c4 = str_data.charCodeAt(i + 3);
			c1 = ((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
			c1 -= 0x10000;
			tmp_arr[ac++] = String.fromCharCode(0xD800 | ((c1>>10) & 0x3FF));
			tmp_arr[ac++] = String.fromCharCode(0xDC00 | (c1 & 0x3FF));
			i += 4;
		}
	}

	return tmp_arr.join('');
}

function utf8_encode (argString) 
{
	// *     example 1: utf8_encode('Kevin van Zonneveld');
	// *     returns 1: 'Kevin van Zonneveld'
	if (argString === null || typeof argString === "undefined") {
		return "";
	}

	var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	var utftext = '',
	    start, end, stringl = 0;

	start = end = 0;
	stringl = string.length;
	for (var n = 0; n < stringl; n++) {
		var c1 = string.charCodeAt(n);
		var enc = null;

		if (c1 < 128) {
			end++;
		} else if (c1 > 127 && c1 < 2048) {
			enc = String.fromCharCode(
					(c1 >> 6)        | 192,
					( c1        & 63) | 128
					);
		} else if (c1 & 0xF800 != 0xD800) {
			enc = String.fromCharCode(
					(c1 >> 12)       | 224,
					((c1 >> 6)  & 63) | 128,
					( c1        & 63) | 128
					);
		} else { // surrogate pairs
			if (c1 & 0xFC00 != 0xD800) { throw new RangeError("Unmatched trail surrogate at " + n); }
			var c2 = string.charCodeAt(++n);
			if (c2 & 0xFC00 != 0xDC00) { throw new RangeError("Unmatched lead surrogate at " + (n-1)); }
			c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
			enc = String.fromCharCode(
					(c1 >> 18)       | 240,
					((c1 >> 12) & 63) | 128,
					((c1 >> 6)  & 63) | 128,
					( c1        & 63) | 128
					);
		}
		if (enc !== null) {
			if (end > start) {
				utftext += string.slice(start, end);
			}
			utftext += enc;
			start = end = n + 1;
		}
	}

	if (end > start) {
		utftext += string.slice(start, stringl);
	}

	return utftext;
}

function parse_url (str, component) 
{
	var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
	    'relative', 'path', 'directory', 'file', 'query', 'fragment'],
	    ini = (this.php_js && this.php_js.ini) || {},
	    mode = (ini['phpjs.parse_url.mode'] && ini['phpjs.parse_url.mode'].local_value) || 'php',
	    parser = {
php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
	    };

	var m = parser[mode].exec(str),
	    uri = {},
	    i = 14;
	while (i--) {
		if (m[i]) {
			uri[key[i]] = m[i];
		}
	}

	if (component) {
		return uri[component.replace('PHP_URL_', '').toLowerCase()];
	}
	if (mode !== 'php') {
		var name = (ini['phpjs.parse_url.queryKey'] &&
				ini['phpjs.parse_url.queryKey'].local_value) || 'queryKey';
		parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
		uri[name] = {};
		query = uri[key[12]] || '';
		query.replace(parser, function ($0, $1, $2) {
				if ($1) {uri[name][$1] = $2;}
				});
	}
	delete uri.source;
	return uri;
}

!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.md5=t}(this);

function rawurlencode(str) 
{
	str = (str + '').toString();
	return encodeURIComponent(str)
		.replace(/!/g, '%21').replace(/'/g, '%27')
		.replace(/\(/g, '%28').replace(/\)/g, '%29')
		.replace(/\*/g, '%2A');
}

function rawurldecode(str) 
{
	return decodeURIComponent((str + '')
		.replace(/%(?![\da-f]{2})/gi, 
		function() {return '%25';}));
}

main();})();}
