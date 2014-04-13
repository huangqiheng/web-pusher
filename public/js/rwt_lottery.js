(function(){

load_library();
load_modal_pop('tips', 'clicker', 'close-btn');

var data = window.omp_global_data;
data.msg_hookers.push(msg_hooker);
var lottery_prefix = 'http://forms.appgame.com/lottery/';
var isok_last = false;
var is_client = false;

//运行模式判断
if (data.url_matched(['forms\.appgame\.com.+id=\\w+&lottery=\\w+'])) {
	data.log('client mode');
	is_client = true;
	client_mode();
} else {
	data.log('server mode');
	is_client = false;
	server_mode();
}


function msg_hooker(cmdbox)
{
	var locked = false;
	if (cmdbox.cmd === 'lottery') {
		//如果是客户端模式，就不用接受消息了
		if (is_client) {
			return null;
		}

		cmdbox.succeed = (cmdbox.status === 'ok');
		if (locked) return null;

		//如果收到的是清理的命令
		if (cmdbox.opt === 'clean') {
			if (modal_showing()) {
				if (!isok_last) {
					jQomp('#close-btn').trigger('click');
				}
			}
			return null;
		}

		//如果上次抽到奖，新的一次又来了，如果不是成功的结果，就直接pass掉
		if (isok_last) {
			if (modal_showing()) {
				if (!cmdbox.succeed) {
					return null;
				}
			}
		}

		locked = true;
		cmdbox.done_counter = 0;
		cmdbox.yes_counter = 0;
		var err_num = parseInt(cmdbox.errno);

		if ((cmdbox.succeed) || ([2003].indexOf(err_num) !== -1)) {
			var rand_arr = shuffle([rand_times(15, 30), rand_times(15, 40), rand_times(15, 50)]);
			animate_imgs('lottery-pic-0', rand_arr.pop(), cmdbox.succeed, rotate_done);
			animate_imgs('lottery-pic-1', rand_arr.pop(), cmdbox.succeed, rotate_done);
			animate_imgs('lottery-pic-2', rand_arr.pop(), cmdbox.succeed, rotate_done);
		} else {
			var error_msg = error_message(cmdbox.errno);
			show_result(error_msg);
		}

		return null;
	}
	return cmdbox;

	function show_result(content) {
		if (cmdbox.succeed) {
			isok_last = true;
			var code = cmdbox.items[0].code;
			jQomp('#tips-title').text('哇，你人品太好了，中奖啦');
			jQomp('#tips-content').text('礼包兑换码：');
			jQomp('#tips-code').text(code);
		} else {
			isok_last = false;
			jQomp('#tips-title').text('抱歉，没有中奖！');
			jQomp('#tips-content').text(content);
			jQomp('#tips-code').text('');

			setTimeout(function(){
				jQomp('#close-btn').trigger('click');
			}, 3000);
		}

		jQomp('#clicker').trigger('click');
		locked = false;
		data.log(content);
	}

	function rotate_done(container_id, force_yes) {
		var first_frame = jQomp('#'+container_id+' .lottery-imglist-use img:first')[0];
		var first_url = jQomp(first_frame).attr('src');
		var first_html = first_frame.outerHTML;

		var yes_frame = jQomp('#'+container_id+' .lottery-imglist img:last')[0];
		var yes_url = jQomp(yes_frame).attr('src');
		var yes_html = yes_frame.outerHTML;
		var no_frame = jQomp('#'+container_id+' .lottery-imglist img:first')[0];
		var no_html = no_frame.outerHTML;

		if (force_yes) {
			jQomp('#'+container_id+' .lottery-imglist-use').html(yes_html);
			cmdbox.yes_counter++;
		} else {
			jQomp('#'+container_id+' .lottery-imglist-use').html(first_html);
			if (first_url === yes_url) {
				cmdbox.yes_counter++;
			}

			if (cmdbox.yes_counter >= 3) {
				jQomp('#'+container_id+' .lottery-imglist-use').html(no_html);
				data.log('force down yes counter');
			}
		}

		if (++cmdbox.done_counter < 3) {return;}

		if (force_yes) {
			var pop_message = '恭喜你，你抽到奖品了，记住复制下来哦。';
			jQomp('#lottery-pic-0 .lottery-imglist-use').html(yes_html);
			jQomp('#lottery-pic-1 .lottery-imglist-use').html(yes_html);
			jQomp('#lottery-pic-2 .lottery-imglist-use').html(yes_html);
		} else {
			var pop_message= error_message(cmdbox.errno);
		}

		show_result(pop_message);
	}

	function animate_imgs(container_id, expand_count, is_yes, cb_done) {
		var imgs_obj = jQomp('#'+container_id+' .lottery-imglist img');

		var current_count = 0;
		var item_count = imgs_obj.length;
		var expand_arr = [];
		while(current_count < expand_count) {
			var iter_index = current_count % item_count;
			expand_arr.push(imgs_obj[iter_index].outerHTML);
			current_count++;
		}

		shuffle(expand_arr);

		var use_objs = jQomp('#'+container_id+' .lottery-imglist-use');
		use_objs.html('');
		for (var index in expand_arr) {
			use_objs.append(expand_arr[index]);
		}

		var frames = jQomp('#'+container_id+' .lottery-imglist-use img');
		frames.css('display', 'none');
		var frameCount = frames.length;
		var i = 0;
		var rotater = setInterval(function () { 
			frames[i % frameCount].style.display = "none";
			frames[++i % frameCount].style.display = "block";
			if (i>=frameCount) {
				clearInterval(rotater);
				cb_done(container_id, is_yes);
			}
		}, 120);
	}

	function rand_times(min, max) {
		return Math.floor((Math.random()*max)+min);
	}

	function error_message(errno) {
		var err_num = parseInt(errno);
		var err_msg = '';
		switch(err_num) {
		case 1000: err_msg = '您领取了的奖品数量已经超过规定了。'; break;
		case 1001: err_msg = '您还没到下一次抽奖时间（'+cmdbox.time_remain+'）'; break;
		case 1002: err_msg = '本次已经领光了，请下一次抽奖时间再来（'+cmdbox.time_remain+'）'; break;
		case 1003: err_msg = '抽奖数量已经超过上限，请下次再来（'+cmdbox.time_remain+'）'; break;
		case 1004: err_msg = '奖品已经全部被领光了，十分抱歉。'; break;
		case 2001: err_msg = '只能用手机来点击抽奖，十分抱歉。'; break;
		case 2003: err_msg = '这次您未能抽到奖品，十分抱歉。请下次再来（'+cmdbox.time_remain+'）'; break;
		case 2004: err_msg = '奖品已经没有了，十分抱歉。请下次再来（'+cmdbox.time_remain+'）'; break;
		default:   err_msg = '发生了未知错误'; break;
		}
		return err_msg;
	}
}

function client_mode()
{
	var href = window.location.href;
	var url_id = href.match(/id=([^&]+)/);
	var url_lotto = href.match(/lottery=([^&]+)/);
	if (!url_id) {return;}
	if (!url_lotto) {return;}

	var target_id = url_id[1];
	var lottery_id = url_lotto[1];
	var lottery_url = lottery_prefix + lottery_id;

	jQomp('.imgdiv').on('click', function(event){
		send_cleanup();
	});

	jQomp('.lottery-client-click').on('click', function(event){
		jQomp.ajax({
			type : "GET",
			dataType : "jsonp",
			data: {
				cmd: 'checkout',
				device: target_id
			},
			url : lottery_url, 
		}).done(send_lottery_result);
		return false;
	});

	function send_lottery_result(cmdbox) 
	{
		cmdbox.cmd = 'lottery';
		cmdbox.option = 'result';
		send_remote_message(cmdbox);
	}

	function send_cleanup() 
	{
		var cmdbox = {};
		cmdbox.cmd = 'lottery';
		cmdbox.opt = 'clean';
		send_remote_message(cmdbox);
	}

	function send_remote_message(cmdbox, cb_done) 
	{
		cmdbox.msgmod = 'realtime';
		cmdbox.text = 'lottery message';

		jQomp.ajax({
			type: 'POST',
			url: 'http://dynamic.appgame.com/api.php',
			beforeSend: function(xhrObj){
				xhrObj.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
				xhrObj.setRequestHeader("Accept","application/json");
			},
			dataType:"text", 
			data: {
				cmd: 	'sendmessage',
				target: [target_id],
				cmdbox: cmdbox,
			},
			success: cb_done
		});
	}

}

function server_mode()
{
	//查看插入的js代码
	var lottery_obj = jQomp('.omp_lottery');
	if (lottery_obj.length === 0) {
		return;
	}

	//随便选择一个来显示
	var length = lottery_obj.length;
	var rand_index=Math.floor(Math.random()*length);
	var lottery = lottery_obj[rand_index];
	var lottery_url = lottery_prefix + lottery.id;
	var qrcode_elmt = jQomp('div.lottery-server-qrcode');
	var qrcode_width = parseInt(jQomp('.lottery-server-qrcode').css('width'));
	var qrcode_height = parseInt(jQomp('.lottery-server-qrcode').css('height'));
	qrcode_elmt.html('');

	check_valid(lottery.id, function(d){
		if (d.status === 'ok') {
			jQomp(qrcode_elmt).css({'padding':'1px', 'background-color':'white'});
			view_qrcode(d.lottery_id);
		} else {
			var err_msg = '';
			var time_offset = d.next_time - d.time;
			switch(d.errno) {
			case 1000: err_msg = '您领取了的奖品数量已经超过规定了。'; break;
			case 1001: err_msg = '您还没到下一次抽奖时间（'+d.time_remain+'）'; break;
			case 1002: err_msg = '本次已经领光了，请下一次抽奖时间再来（'+d.time_remain+'）'; break;
			case 1003: err_msg = '抽奖数量已经超过上限，请下次再来（'+d.time_remain+'）'; break;
			case 1004: err_msg = '奖品已经全部被领光了，十分抱歉。'; break;
			default:   err_msg = '发生了未知错误'; break;
			}
			qrcode_elmt.html('<table style="height: 100%;"><tr><td style="vertical-align: middle; color:red;">'+err_msg+'</td></tr></table>');
		}
	});

	//显示二维码
	function view_qrcode(valid_id)
	{
		var url = 'http://forms.appgame.com/i/ttfc/phone2.html';
		var qrcode_url = build_url(url, {
			id: data.device,
			lottery: valid_id
		});

		data.log(qrcode_url);
		qrcode_elmt.qrcode({text:qrcode_url, width:qrcode_width, height:qrcode_height});
	}

	function check_valid(valid_id, cb_done)
	{
		var url = lottery_prefix + valid_id;;
		jQomp.ajax({
			type : "GET",
			dataType : "jsonp",
			data: {
				cmd: 'valid',
				id: data.device
			},
			url : url, 
		}).done(cb_done);
	}
}

function build_url(url, parameters){
	var qs = "";
	for(var key in parameters) {
		var value = parameters[key];
		qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
	}
	if (qs.length > 0){
		qs = qs.substring(0, qs.length-1); //chop off last "&"
		url = url + "?" + qs;
	}
	return url;
}

function shuffle(array) 
{
	var currentIndex = array.length
		, temporaryValue
		, randomIndex
		;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function load_library()
{
(function(r){r.fn.qrcode=function(h){var s;function u(a){this.mode=s;this.data=a}function o(a,c){this.typeNumber=a;this.errorCorrectLevel=c;this.modules=null;this.moduleCount=0;this.dataCache=null;this.dataList=[]}function q(a,c){if(void 0==a.length)throw Error(a.length+"/"+c);for(var d=0;d<a.length&&0==a[d];)d++;this.num=Array(a.length-d+c);for(var b=0;b<a.length-d;b++)this.num[b]=a[b+d]}function p(a,c){this.totalCount=a;this.dataCount=c}function t(){this.buffer=[];this.length=0}u.prototype={getLength:function(){return this.data.length},
write:function(a){for(var c=0;c<this.data.length;c++)a.put(this.data.charCodeAt(c),8)}};o.prototype={addData:function(a){this.dataList.push(new u(a));this.dataCache=null},isDark:function(a,c){if(0>a||this.moduleCount<=a||0>c||this.moduleCount<=c)throw Error(a+","+c);return this.modules[a][c]},getModuleCount:function(){return this.moduleCount},make:function(){if(1>this.typeNumber){for(var a=1,a=1;40>a;a++){for(var c=p.getRSBlocks(a,this.errorCorrectLevel),d=new t,b=0,e=0;e<c.length;e++)b+=c[e].dataCount;
for(e=0;e<this.dataList.length;e++)c=this.dataList[e],d.put(c.mode,4),d.put(c.getLength(),j.getLengthInBits(c.mode,a)),c.write(d);if(d.getLengthInBits()<=8*b)break}this.typeNumber=a}this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17;this.modules=Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=Array(this.moduleCount);for(var b=0;b<this.moduleCount;b++)this.modules[d][b]=null}this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-
7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(a,c);7<=this.typeNumber&&this.setupTypeNumber(a);null==this.dataCache&&(this.dataCache=o.createData(this.typeNumber,this.errorCorrectLevel,this.dataList));this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,c){for(var d=-1;7>=d;d++)if(!(-1>=a+d||this.moduleCount<=a+d))for(var b=-1;7>=b;b++)-1>=c+b||this.moduleCount<=c+b||(this.modules[a+d][c+b]=
0<=d&&6>=d&&(0==b||6==b)||0<=b&&6>=b&&(0==d||6==d)||2<=d&&4>=d&&2<=b&&4>=b?!0:!1)},getBestMaskPattern:function(){for(var a=0,c=0,d=0;8>d;d++){this.makeImpl(!0,d);var b=j.getLostPoint(this);if(0==d||a>b)a=b,c=d}return c},createMovieClip:function(a,c,d){a=a.createEmptyMovieClip(c,d);this.make();for(c=0;c<this.modules.length;c++)for(var d=1*c,b=0;b<this.modules[c].length;b++){var e=1*b;this.modules[c][b]&&(a.beginFill(0,100),a.moveTo(e,d),a.lineTo(e+1,d),a.lineTo(e+1,d+1),a.lineTo(e,d+1),a.endFill())}return a},
setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(a=8;a<this.moduleCount-8;a++)null==this.modules[6][a]&&(this.modules[6][a]=0==a%2)},setupPositionAdjustPattern:function(){for(var a=j.getPatternPosition(this.typeNumber),c=0;c<a.length;c++)for(var d=0;d<a.length;d++){var b=a[c],e=a[d];if(null==this.modules[b][e])for(var f=-2;2>=f;f++)for(var i=-2;2>=i;i++)this.modules[b+f][e+i]=-2==f||2==f||-2==i||2==i||0==f&&0==i?!0:!1}},setupTypeNumber:function(a){for(var c=
j.getBCHTypeNumber(this.typeNumber),d=0;18>d;d++){var b=!a&&1==(c>>d&1);this.modules[Math.floor(d/3)][d%3+this.moduleCount-8-3]=b}for(d=0;18>d;d++)b=!a&&1==(c>>d&1),this.modules[d%3+this.moduleCount-8-3][Math.floor(d/3)]=b},setupTypeInfo:function(a,c){for(var d=j.getBCHTypeInfo(this.errorCorrectLevel<<3|c),b=0;15>b;b++){var e=!a&&1==(d>>b&1);6>b?this.modules[b][8]=e:8>b?this.modules[b+1][8]=e:this.modules[this.moduleCount-15+b][8]=e}for(b=0;15>b;b++)e=!a&&1==(d>>b&1),8>b?this.modules[8][this.moduleCount-
b-1]=e:9>b?this.modules[8][15-b-1+1]=e:this.modules[8][15-b-1]=e;this.modules[this.moduleCount-8][8]=!a},mapData:function(a,c){for(var d=-1,b=this.moduleCount-1,e=7,f=0,i=this.moduleCount-1;0<i;i-=2)for(6==i&&i--;;){for(var g=0;2>g;g++)if(null==this.modules[b][i-g]){var n=!1;f<a.length&&(n=1==(a[f]>>>e&1));j.getMask(c,b,i-g)&&(n=!n);this.modules[b][i-g]=n;e--; -1==e&&(f++,e=7)}b+=d;if(0>b||this.moduleCount<=b){b-=d;d=-d;break}}}};o.PAD0=236;o.PAD1=17;o.createData=function(a,c,d){for(var c=p.getRSBlocks(a,
c),b=new t,e=0;e<d.length;e++){var f=d[e];b.put(f.mode,4);b.put(f.getLength(),j.getLengthInBits(f.mode,a));f.write(b)}for(e=a=0;e<c.length;e++)a+=c[e].dataCount;if(b.getLengthInBits()>8*a)throw Error("code length overflow. ("+b.getLengthInBits()+">"+8*a+")");for(b.getLengthInBits()+4<=8*a&&b.put(0,4);0!=b.getLengthInBits()%8;)b.putBit(!1);for(;!(b.getLengthInBits()>=8*a);){b.put(o.PAD0,8);if(b.getLengthInBits()>=8*a)break;b.put(o.PAD1,8)}return o.createBytes(b,c)};o.createBytes=function(a,c){for(var d=
0,b=0,e=0,f=Array(c.length),i=Array(c.length),g=0;g<c.length;g++){var n=c[g].dataCount,h=c[g].totalCount-n,b=Math.max(b,n),e=Math.max(e,h);f[g]=Array(n);for(var k=0;k<f[g].length;k++)f[g][k]=255&a.buffer[k+d];d+=n;k=j.getErrorCorrectPolynomial(h);n=(new q(f[g],k.getLength()-1)).mod(k);i[g]=Array(k.getLength()-1);for(k=0;k<i[g].length;k++)h=k+n.getLength()-i[g].length,i[g][k]=0<=h?n.get(h):0}for(k=g=0;k<c.length;k++)g+=c[k].totalCount;d=Array(g);for(k=n=0;k<b;k++)for(g=0;g<c.length;g++)k<f[g].length&&
(d[n++]=f[g][k]);for(k=0;k<e;k++)for(g=0;g<c.length;g++)k<i[g].length&&(d[n++]=i[g][k]);return d};s=4;for(var j={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,
78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var c=a<<10;0<=j.getBCHDigit(c)-j.getBCHDigit(j.G15);)c^=j.G15<<j.getBCHDigit(c)-j.getBCHDigit(j.G15);return(a<<10|c)^j.G15_MASK},getBCHTypeNumber:function(a){for(var c=a<<12;0<=j.getBCHDigit(c)-
j.getBCHDigit(j.G18);)c^=j.G18<<j.getBCHDigit(c)-j.getBCHDigit(j.G18);return a<<12|c},getBCHDigit:function(a){for(var c=0;0!=a;)c++,a>>>=1;return c},getPatternPosition:function(a){return j.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,c,d){switch(a){case 0:return 0==(c+d)%2;case 1:return 0==c%2;case 2:return 0==d%3;case 3:return 0==(c+d)%3;case 4:return 0==(Math.floor(c/2)+Math.floor(d/3))%2;case 5:return 0==c*d%2+c*d%3;case 6:return 0==(c*d%2+c*d%3)%2;case 7:return 0==(c*d%3+(c+d)%2)%2;default:throw Error("bad maskPattern:"+
a);}},getErrorCorrectPolynomial:function(a){for(var c=new q([1],0),d=0;d<a;d++)c=c.multiply(new q([1,l.gexp(d)],0));return c},getLengthInBits:function(a,c){if(1<=c&&10>c)switch(a){case 1:return 10;case 2:return 9;case s:return 8;case 8:return 8;default:throw Error("mode:"+a);}else if(27>c)switch(a){case 1:return 12;case 2:return 11;case s:return 16;case 8:return 10;default:throw Error("mode:"+a);}else if(41>c)switch(a){case 1:return 14;case 2:return 13;case s:return 16;case 8:return 12;default:throw Error("mode:"+
a);}else throw Error("type:"+c);},getLostPoint:function(a){for(var c=a.getModuleCount(),d=0,b=0;b<c;b++)for(var e=0;e<c;e++){for(var f=0,i=a.isDark(b,e),g=-1;1>=g;g++)if(!(0>b+g||c<=b+g))for(var h=-1;1>=h;h++)0>e+h||c<=e+h||0==g&&0==h||i==a.isDark(b+g,e+h)&&f++;5<f&&(d+=3+f-5)}for(b=0;b<c-1;b++)for(e=0;e<c-1;e++)if(f=0,a.isDark(b,e)&&f++,a.isDark(b+1,e)&&f++,a.isDark(b,e+1)&&f++,a.isDark(b+1,e+1)&&f++,0==f||4==f)d+=3;for(b=0;b<c;b++)for(e=0;e<c-6;e++)a.isDark(b,e)&&!a.isDark(b,e+1)&&a.isDark(b,e+
2)&&a.isDark(b,e+3)&&a.isDark(b,e+4)&&!a.isDark(b,e+5)&&a.isDark(b,e+6)&&(d+=40);for(e=0;e<c;e++)for(b=0;b<c-6;b++)a.isDark(b,e)&&!a.isDark(b+1,e)&&a.isDark(b+2,e)&&a.isDark(b+3,e)&&a.isDark(b+4,e)&&!a.isDark(b+5,e)&&a.isDark(b+6,e)&&(d+=40);for(e=f=0;e<c;e++)for(b=0;b<c;b++)a.isDark(b,e)&&f++;a=Math.abs(100*f/c/c-50)/5;return d+10*a}},l={glog:function(a){if(1>a)throw Error("glog("+a+")");return l.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;256<=a;)a-=255;return l.EXP_TABLE[a]},EXP_TABLE:Array(256),
LOG_TABLE:Array(256)},m=0;8>m;m++)l.EXP_TABLE[m]=1<<m;for(m=8;256>m;m++)l.EXP_TABLE[m]=l.EXP_TABLE[m-4]^l.EXP_TABLE[m-5]^l.EXP_TABLE[m-6]^l.EXP_TABLE[m-8];for(m=0;255>m;m++)l.LOG_TABLE[l.EXP_TABLE[m]]=m;q.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var c=Array(this.getLength()+a.getLength()-1),d=0;d<this.getLength();d++)for(var b=0;b<a.getLength();b++)c[d+b]^=l.gexp(l.glog(this.get(d))+l.glog(a.get(b)));return new q(c,0)},mod:function(a){if(0>
this.getLength()-a.getLength())return this;for(var c=l.glog(this.get(0))-l.glog(a.get(0)),d=Array(this.getLength()),b=0;b<this.getLength();b++)d[b]=this.get(b);for(b=0;b<a.getLength();b++)d[b]^=l.gexp(l.glog(a.get(b))+c);return(new q(d,0)).mod(a)}};p.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],
[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,
116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,
43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,
3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,
55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,
45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];p.getRSBlocks=function(a,c){var d=p.getRsBlockTable(a,c);if(void 0==d)throw Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+c);for(var b=d.length/3,e=[],f=0;f<b;f++)for(var h=d[3*f+0],g=d[3*f+1],j=d[3*f+2],l=0;l<h;l++)e.push(new p(g,j));return e};p.getRsBlockTable=function(a,c){switch(c){case 1:return p.RS_BLOCK_TABLE[4*(a-1)+0];case 0:return p.RS_BLOCK_TABLE[4*(a-1)+1];case 3:return p.RS_BLOCK_TABLE[4*
(a-1)+2];case 2:return p.RS_BLOCK_TABLE[4*(a-1)+3]}};t.prototype={get:function(a){return 1==(this.buffer[Math.floor(a/8)]>>>7-a%8&1)},put:function(a,c){for(var d=0;d<c;d++)this.putBit(1==(a>>>c-d-1&1))},getLengthInBits:function(){return this.length},putBit:function(a){var c=Math.floor(this.length/8);this.buffer.length<=c&&this.buffer.push(0);a&&(this.buffer[c]|=128>>>this.length%8);this.length++}};"string"===typeof h&&(h={text:h});h=r.extend({},{render:"canvas",width:256,height:256,typeNumber:-1,
correctLevel:2,background:"#ffffff",foreground:"#000000"},h);return this.each(function(){var a;if("canvas"==h.render){a=new o(h.typeNumber,h.correctLevel);a.addData(h.text);a.make();var c=document.createElement("canvas");c.width=h.width;c.height=h.height;for(var d=c.getContext("2d"),b=h.width/a.getModuleCount(),e=h.height/a.getModuleCount(),f=0;f<a.getModuleCount();f++)for(var i=0;i<a.getModuleCount();i++){d.fillStyle=a.isDark(f,i)?h.foreground:h.background;var g=Math.ceil((i+1)*b)-Math.floor(i*b),
j=Math.ceil((f+1)*b)-Math.floor(f*b);d.fillRect(Math.round(i*b),Math.round(f*e),g,j)}}else{a=new o(h.typeNumber,h.correctLevel);a.addData(h.text);a.make();c=r("<table></table>").css("width",h.width+"px").css("height",h.height+"px").css("border","0px").css("border-collapse","collapse").css("background-color",h.background);d=h.width/a.getModuleCount();b=h.height/a.getModuleCount();for(e=0;e<a.getModuleCount();e++){f=r("<tr></tr>").css("height",b+"px").appendTo(c);for(i=0;i<a.getModuleCount();i++)r("<td></td>").css("width",
d+"px").css("background-color",a.isDark(e,i)?h.foreground:h.background).appendTo(f)}}a=c;jQomp(a).appendTo(this)})}})(jQomp);

}

function modal_showing()
{
	return ('block' === jQomp('.modalPopLite-mask:first')[0].style.display);
}

function load_modal_pop(win_id, open_id, close_id)
{
(function (a) { var b = 0; a.fn.modalPopLite = function (c) { var c = a.extend({}, { openButton: "modalPopLite-open-btn", closeButton: "modalPopLite-close-btn", isModal: false }, c); return this.each(function () { b++; var d = b; var e = false; obj = a(this); triggerObj = c.openButton; closeObj = c.closeButton; isReallyModel = c.isModal; obj.before('<div id="modalPopLite-mask' + d + '" style="width:100%" class="modalPopLite-mask" />'); obj.wrap('<div id="modalPopLite-wrapper' + d + '" style="left: -10000px;" class="modalPopLite-wrapper" />'); obj.addClass("modalPopLite-child-" + d); a(triggerObj).on("click", function (b) { b.preventDefault(); var c = a(window).width(); var f = a(window).height(); var g = a(".modalPopLite-child-" + d).outerWidth(); var h = a(".modalPopLite-child-" + d).outerHeight(); var i = c / 2 - g / 2; var j = f / 2 - h / 2; a("#modalPopLite-mask" + d).css("height", f + "px"); a("#modalPopLite-mask" + d).fadeTo("slow", .6); a("#modalPopLite-wrapper" + d).css({ left: i + "px", top: j }); a("#modalPopLite-wrapper" + d).fadeIn("slow"); e = true }); a(closeObj).on("click", function (b) { b.preventDefault(); a("#modalPopLite-mask" + d).hide(); a("#modalPopLite-wrapper" + d).css("left", "-10000px"); e = false }); if (!isReallyModel) { a("#modalPopLite-mask" + d).click(function (b) { b.preventDefault(); a(this).hide(); a("#modalPopLite-wrapper" + d).css("left", "-10000px"); e = false }) } a(window).resize(function () { if (e) { var b = a(window).width(); var c = a(window).height(); var f = a(".modalPopLite-child-" + d).outerWidth(); var g = a(".modalPopLite-child-" + d).outerHeight(); var h = b / 2 - f / 2; var i = c / 2 - g / 2; a("#modalPopLite-wrapper" + d).css({ left: h + "px", top: i }) } }) }) }; a.fn.modalPopLite.Close = function (b) { a("#modalPopLite-mask" + b).hide(); a("#modalPopLite-wrapper" + thisPopID).css("left", "-10000px") }; a.fn.modalPopLite.ShowProgress = function () { a('<div class="popBox-ajax-progress"></div>').appendTo("body") }; a.fn.modalPopLite.HideProgress = function () { a(".popBox-ajax-progress").remove() } })(window.jQomp);

var dialog_css = hereDoc(function() {/*!
<style type="text/css">
.modalPopLite-mask
{
	position:fixed;
	z-index:9000;
	background-color:#000;
	display:none;
	top:0px;
	left:0px;
	width:100%;
}
.modalPopLite-wrapper
{
	position:fixed;
	z-index:9999;
	-webkit-border-radius: .5em; 
	-moz-border-radius: .5em;
	border-radius: .5em;
	-webkit-box-shadow: 0 0px 25px rgba(0,0,0,.9);
	-moz-box-shadow: 0 0px 25px rgba(0,0,0,.9);
	box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.4);    
	border: 5px solid rgb(000, 0, 0);
	border: 5px solid rgba(000, 0, 0, .5);
}
.popBox-holder 
{
	display:none;
	position: absolute;
	left: 0px;
	top: 0px;
	width:100%;
	height:100%;
	text-align:center;
	z-index: 999;
	background-color:#000;
	filter:alpha(opacity=40);
	opacity:0.5;
}
.popBox-container 
{
	display:none;
	background-color: #fff;
	border:4px solid #000;
	padding:10px;
	text-align:center;
	z-index: 1000;
	-webkit-border-radius: .5em; 
	-moz-border-radius: .5em;
	border-radius: .5em;
	-webkit-box-shadow: 0 1px 2px rgba(0,0,0,.2);
	-moz-box-shadow: 0 1px 2px rgba(0,0,0,.2);
	box-shadow: 0 1px 2px rgba(0,0,0,.2);
}
.popBox-container .done-button
{
	margin-top:10px;
}
.popBox-container .button 
{
	display: inline-block;
	zoom: 1; 
	*display: inline;
	vertical-align: baseline;
	margin: 0 2px;
	outline: none;
	cursor: pointer;
	text-align: center;
	text-decoration: none;
	font: 14px/100% Arial, Helvetica, sans-serif;
	padding: .5em 2em .55em;
	text-shadow: 0 1px 1px rgba(0,0,0,.3);
	-webkit-border-radius: .5em; 
	-moz-border-radius: .5em;
	border-radius: .5em;
	-webkit-box-shadow: 0 1px 2px rgba(0,0,0,.2);
	-moz-box-shadow: 0 1px 2px rgba(0,0,0,.2);
	box-shadow: 0 1px 2px rgba(0,0,0,.2);
}
.popBox-container .button:hover 
{
	text-decoration: none;
}
.popBox-container .button:active 
{
	position: relative;
	top: 1px;
}

.popBox-container .small 
{
	font-size: 11px;
	padding: .2em 1em .275em;
}
.popBox-container .blue 
{
	color: #d9eef7;
	border: solid 1px #0076a3;
	background: #0095cd;
	background: -webkit-gradient(linear, left top, left bottom, from(#00adee), to(#0078a5));
	background: -moz-linear-gradient(top,  #00adee,  #0078a5);
	filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr='#00adee', endColorstr='#0078a5');
}
.popBox-container .blue:hover 
{
	background: #007ead;
	background: -webkit-gradient(linear, left top, left bottom, from(#0095cc), to(#00678e));
	background: -moz-linear-gradient(top,  #0095cc,  #00678e);
	filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr='#0095cc', endColorstr='#00678e');
}
.popBox-container .blue:active 
{
	color: #80bed6;
	background: -webkit-gradient(linear, left top, left bottom, from(#0078a5), to(#00adee));
	background: -moz-linear-gradient(top,  #0078a5,  #00adee);
	filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr='#0078a5', endColorstr='#00adee');
}
.popBox-ajax-progress
{
	position: fixed;
	left: 0px;
	top: 0px;
	width:100%;
	height:100%;
	text-align:center;
	z-index: 99999;
	background-color:#000;
	filter:alpha(opacity=40);
	opacity:0.5;
	background-image: url('ajax-loader.gif');
	background-repeat:no-repeat;
	background-position:center center;
}
</style>
	 */});
	jQomp('head').append(dialog_css);


	jQomp('#'+win_id).modalPopLite({ openButton: '#'+open_id, closeButton: '#'+close_id });

	function hereDoc(f) {
		return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
	}
}


})();


