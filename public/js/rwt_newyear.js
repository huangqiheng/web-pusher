(function(){

load_library();
load_modal_pop();
var data = window.omp_global_data;
var lotto_click_class = 'activityBtn-1';
var lotto_property_name = 'lottery';

var lotto_links = jQomp('.'+lotto_click_class);
for(var index=0; index<lotto_links.length; index++) {
	var obj = lotto_links[index];
	if (typeof obj !== 'object') {
		continue;
	}

	if (!(obj instanceof HTMLElement)) {
		continue;
	}

	var lottery_url = obj.getAttribute(lotto_property_name);

	if (lottery_url === 'disable') {
		data.log('disable');
		jQomp(obj).closest('.itemBody').css('display','none');
	}
}

jQomp('.'+lotto_click_class).on('click', function(event){
	var link_obj = jQomp(event.currentTarget)[0];
	var lottery_url = link_obj.getAttribute(lotto_property_name);
	var ori_link = link_obj.href;
	if (lottery_url === null) {
		return true;
	}

	if (lottery_url === 'disable') {
		return true;
	}

	jQomp.ajax({
		type : "GET",
		dataType : "jsonp",
		data: {
			cmd: 'checkout',
			device: data.device 
		},
		url : lottery_url, 
	}).done(function(d){
		if (d.status === 'ok') {
			var code = d.items[0].code;
			modal_open('哇，您运气不错，中奖啦', '礼包兑换码(请复制或截图保存)：', code);
		} else {
			var content = error_message(d.errno, d.time_remain);
			modal_open('抱歉，没有中奖！', content);
		}
	});
	return false;
});


function load_library()
{

}

function modal_showing()
{
	return ('block' === jQomp('.modalPopLite-mask:first')[0].style.display);
}

function modal_close()
{
	jQomp('#omp_close_btn').trigger('click');
}

function modal_open(title, content, code)
{
	jQomp('#tips-title').text(title);
	jQomp('#tips-content').text(content);
	if (code === undefined) {
		jQomp('#tips-code').text('');
		setTimeout(function(){
			jQomp('#omp_close_btn').trigger('click');
		}, 3000);
	} else {
		jQomp('#tips-code').text(code);
	}

	jQomp('#omp_clicker').trigger('click');
}

function load_modal_pop()
{
if (window.modal_loaded !== undefined) {return;}
window.modal_loaded = true;

(function (a) { var b = 0; a.fn.modalPopLite = function (c) { var c = a.extend({}, { openButton: "modalPopLite-open-btn", closeButton: "modalPopLite-close-btn", isModal: false }, c); return this.each(function () { b++; var d = b; var e = false; obj = a(this); triggerObj = c.openButton; closeObj = c.closeButton; isReallyModel = c.isModal; obj.before('<div id="modalPopLite-mask' + d + '" style="width:100%" class="modalPopLite-mask" />'); obj.wrap('<div id="modalPopLite-wrapper' + d + '" style="left: -10000px;" class="modalPopLite-wrapper" />'); obj.addClass("modalPopLite-child-" + d); a(triggerObj).on("click", function (b) { b.preventDefault(); var c = a(window).width(); var f = a(window).height(); var g = a(".modalPopLite-child-" + d).outerWidth(); var h = a(".modalPopLite-child-" + d).outerHeight(); var i = c / 2 - g / 2; var j = f / 2 - h / 2; a("#modalPopLite-mask" + d).css("height", f + "px"); a("#modalPopLite-mask" + d).fadeTo("slow", .6); a("#modalPopLite-wrapper" + d).css({ left: i + "px", top: j }); a("#modalPopLite-wrapper" + d).fadeIn("slow"); e = true }); a(closeObj).on("click", function (b) { b.preventDefault(); a("#modalPopLite-mask" + d).hide(); a("#modalPopLite-wrapper" + d).css("left", "-10000px"); e = false }); if (!isReallyModel) { a("#modalPopLite-mask" + d).click(function (b) { b.preventDefault(); a(this).hide(); a("#modalPopLite-wrapper" + d).css("left", "-10000px"); e = false }) } a(window).resize(function () { if (e) { var b = a(window).width(); var c = a(window).height(); var f = a(".modalPopLite-child-" + d).outerWidth(); var g = a(".modalPopLite-child-" + d).outerHeight(); var h = b / 2 - f / 2; var i = c / 2 - g / 2; a("#modalPopLite-wrapper" + d).css({ left: h + "px", top: i }) } }) }) }; a.fn.modalPopLite.Close = function (b) { a("#modalPopLite-mask" + b).hide(); a("#modalPopLite-wrapper" + thisPopID).css("left", "-10000px") }; a.fn.modalPopLite.ShowProgress = function () { a('<div class="popBox-ajax-progress"></div>').appendTo("body") }; a.fn.modalPopLite.HideProgress = function () { a(".popBox-ajax-progress").remove() } })(window.jQomp);

var win_id = 'omp_tips', open_id = 'omp_clicker', close_id = 'omp_close_btn';

var dialog_form = hereDoc(function() {/*!
<style type="text/css">
#omp_tips { max-width:270px; background:#5f0165; border:1px solid #6d1e72; font-family: Arial, 'Microsoft YaHei';}
.tipstop { height:34px; padding-top:15px; overflow:hidden; background:url(http://forms.appgame.com/i/ttfc/style/tips-topbg.gif) repeat-x center top; text-align:center; font-size:15px; font-weight:bold; color:#c758ce; }
.tipstop img { margin-right:10px; margin-bottom:-1px;}
.omp_tipscontent { padding:20px; text-align:center; line-height:180%; font-size:15px; font-weight:bold;  color:#FFF; position:relative;}
.omp_tipscontent span { color:#FFCC00}
.omp_tipscontent img.close { width:18px; height:18px; position:absolute; right:0px; bottom:0px; cursor:pointer;}
</style>
<div id="omp_clicker"></div>
<div id="omp_tips">
        <div class="tipstop"><img src="http://forms.appgame.com/i/ttfc/style/tips-icon.png" alt=""><span id="tips-title">哇，你人品太好了，中奖啦！</span></div>
    <div class="omp_tipscontent">
    <div id="tips-content">礼包兑换码</div><span id="tips-code">KIRELCOE4Y79IO393OD2JJE</span>
    <img src="http://forms.appgame.com/i/ttfc/style/tips-close.png" class="close" id="omp_close_btn" alt="关闭窗口">
    </div>
</div>
	 */});
	jQomp('body').append(dialog_form);


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

function error_message(errno, content) {
	var err_num = parseInt(errno);
	var err_msg = '';
	switch(err_num) {
	case 1000: err_msg = '您领取了的奖品数量已经超过规定了。'; break;
	case 1001: err_msg = '您还没到下一次抽奖时间（'+content+'）'; break;
	case 1002: err_msg = '本次已经领光了，请下一次抽奖时间再来（'+content+'）'; break;
	case 1003: err_msg = '抽奖数量已经超过上限，请下次再来（'+content+'）'; break;
	case 1004: err_msg = '奖品已经全部被领光了，十分抱歉。'; break;
	case 2001: err_msg = '只能用手机来点击抽奖，十分抱歉。'; break;
	case 2003: err_msg = '这次您未能抽到奖品，十分抱歉。请下次再来（'+content+'）'; break;
	case 2004: err_msg = '奖品已经没有了，十分抱歉。请下次再来（'+content+'）'; break;
	default:   err_msg = '发生了未知错误'; break;
	}
	return err_msg;
}

})();
