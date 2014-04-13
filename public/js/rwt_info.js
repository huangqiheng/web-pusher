(function(){

if (info_click_selectors === undefined) {return;}
var data = window.omp_global_data;
load_modal_pop();

for(var index in info_click_selectors) {
	var selector = info_click_selectors[index];
	var clickers = jQomp(selector);
	for (var i=0; i<clickers.length; i++) {
		var click_elmt = clickers[i];
		var param = [];
		param.push(click_elmt.getAttribute('theid'));
		param.push(click_elmt.getAttribute('db'));
		param.push(click_elmt.getAttribute('table'));
		param.push(click_elmt.getAttribute('caption'));
		jQomp(click_elmt).on('click', param, function(event){
			var input_id = event.data[0];
			var db_name = event.data[1];
			var table_name = event.data[2];
			var caption = event.data[3];
			var email = jQomp('#'+input_id).val();
			var emails = [email];

			if (!validateEmail(email)) {
				modal_open('邮件格式有误', '请填写正确的电子邮件地址，这十分重要，奖品将会通过此邮箱发放。');
				return false;
			}

			var group = {};
			group['ID'] = '';
			group['device'] = data.device;
			group['infos'] = emails;

			var new_data = {};
			new_data['general'] = group;

			var req_data = {};
			req_data['mapper'] = data.device;
			req_data['data'] = new_data;
			req_data['db_name'] = db_name;
			req_data['table_name'] = table_name;
			req_data['apikey'] = 'cb96103ebfb44ba7885d4cd56dbf9f61';
			var url = 'http://db.appgame.com/service/binder/data.php';

			post(url, req_data, function(d){
				if (d.hasOwnProperty('status')) {
					if (d.status === 'ok') {
						var code = caption+': '+email;
						modal_open('提交成功', '你的抽奖已经提交成功，感谢您的参与！重复提交以最后提交的为准。您当前提交的是', code);
					} else {
						modal_open('提交失败', d.error);
					}
					jQomp('#'+input_id).val('');
				}
			},function(){
				modal_open('提交失败', '可能是网络故障问题，你的提交失败了，可稍后再试。');
			});

			return false;
		});
	}
}

function post(url, data, cb_done, cb_fail)
{
	jQomp.ajax({
		type : 'POST',
		dataType : "jsonp",
		data: data,
		url : url,
	}).done(cb_done).fail(cb_fail);
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

function validateEmail(email) { 
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}


})();
