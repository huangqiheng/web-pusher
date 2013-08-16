function identify_init(binder) { (function(){

function main()
{
	var data = window.omp_global_data;
	var device = data.device;
	data.canbe_replaced = canbe_replaced;

	binder(get_user_name());
	disqus_report(device, binder);
}

function canbe_replaced()
{

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

    jQomp.each(username_selector, function() {
        if (!window.location.hostname.match(new RegExp(this.host, 'i')))
            return true;

        id_obj['name'] = this.name;
        id_obj['caption'] = this.caption;
        id_obj['username'] = travers_seletors(this.filters.username);
        id_obj['nickname'] = travers_seletors(this.filters.nickname);

        return false;
    });

    return id_obj;
}

var replace_containers = [
    {
    	url_regex: [
	], 
        ins_selectors: [
	    {'selector': '', 
	     'position': 'before',  //or after
	     'hidden'  : true}
	]
    }
];

var username_selector = [{
    'name':'bbs-appgame',
    'caption':'论坛',
    'host':'bbs.appgame.com',
    'filters':{
        username: [{selector:"div#um strong.vwmy a:first"}],
        nickname: []
    }
},{
    'name':'appgame',
    'caption':'任玩堂',
    'host':"appgame.com",
    'filters':{
        username: [{selector:"a span.username"}],
	//{'selector':"", 'revisor': function (str) {return str;}}
        nickname: [{selector:"a span.display-name"}]
    }
}];

//jquery.base64
"use strict";jQomp.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQomp));


main(); })();}
