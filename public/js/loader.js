if(self==top){
	omploader_main();
}

function omploader_main() 
{
	var push_bypass_regexp = [
		'-homemini$',
	];

	for (var index in push_bypass_regexp) {
		var patt_str = push_bypass_regexp[index];
		var patt = new RegExp(patt_str, 'i');
		if (patt.test(window.location.href)) {
			console.log('bypass url: '+window.location.href+' as '+patt_str);
			return;
		}
	}

	window.omp_global_data = {};
	var data = window.omp_global_data;

	//判断是不是ie
	data.msie = /msie/.test(navigator.userAgent.toLowerCase());
	//管理服务器所在网址修正，那些js、css什么的url
	data.root_prefix = 'http://dynamic.appgame.com/';
	//推送服务器地址，可以和管理服务器在不同的域名上
	data.push_server = 'dynamic.appgame.com';
	//推送模式优先级，一个不行会再试下一个，不过timeout时间似乎很长
	//window.push_modes = (msie)? 'stream|longpolling' : 'websocket|eventsource|longpolling|stream'; 
	data.push_modes = (data.msie)? 'stream' : 'websocket|eventsource|longpolling|stream'; 
	//推送模块日志显示级别
	data.push_loglevel = 'debug';
	//head.load.min

	var LazyLoad=(function(j){var g,h,b={},e=0,f={css:[],js:[]},m=j.styleSheets;function l(q,p){var r=j.createElement(q),o;for(o in p){if(p.hasOwnProperty(o)){r.setAttribute(o,p[o])}}return r}function i(o){var r=b[o],s,q;if(r){s=r.callback;q=r.urls;q.shift();e=0;if(!q.length){s&&s.call(r.context,r.obj);b[o]=null;f[o].length&&k(o)}}}function c(){var o=navigator.userAgent;g={async:j.createElement("script").async===true};(g.webkit=/AppleWebKit\//.test(o))||(g.ie=/MSIE/.test(o))||(g.opera=/Opera/.test(o))||(g.gecko=/Gecko\//.test(o))||(g.unknown=true)}var n={Version:function(){var o=999;if(navigator.appVersion.indexOf("MSIE")!=-1){o=parseFloat(navigator.appVersion.split("MSIE")[1])}return o}};function k(A,z,B,w,s){var u=function(){i(A)},C=A==="css",q=[],v,x,t,r,y,o;g||c();if(z){z=typeof z==="string"?[z]:z.concat();if(C||g.async||g.gecko||g.opera){f[A].push({urls:z,callback:B,obj:w,context:s})}else{for(v=0,x=z.length;v<x;++v){f[A].push({urls:[z[v]],callback:v===x-1?B:null,obj:w,context:s})}}}if(b[A]||!(r=b[A]=f[A].shift())){return}h||(h=j.head||j.getElementsByTagName("head")[0]);y=r.urls;for(v=0,x=y.length;v<x;++v){o=y[v];if(C){t=g.gecko?l("style"):l("link",{href:o,rel:"stylesheet"})}else{t=l("script",{src:o});t.async=false}t.className="lazyload";t.setAttribute("charset","utf-8");if(g.ie&&!C&&n.Version()<10){t.onreadystatechange=function(){if(/loaded|complete/.test(t.readyState)){t.onreadystatechange=null;u()}}}else{if(C&&(g.gecko||g.webkit)){if(g.webkit){r.urls[v]=t.href;d()}else{t.innerHTML='@import "'+o+'";';a(t)}}else{t.onload=t.onerror=u}}q.push(t)}for(v=0,x=q.length;v<x;++v){h.appendChild(q[v])}}function a(q){var p;try{p=!!q.sheet.cssRules}catch(o){e+=1;if(e<200){setTimeout(function(){a(q)},50)}else{p&&i("css")}return}i("css")}function d(){var p=b.css,o;if(p){o=m.length;while(--o>=0){if(m[o].href===p.urls[0]){i("css");break}}e+=1;if(p){if(e<200){setTimeout(d,50)}else{i("css")}}}}return{css:function(q,r,p,o){k("css",q,r,p,o)},js:function(q,r,p,o){k("js",q,r,p,o)}}})(this.document);

	data.LazyLoad = LazyLoad;

	LazyLoad.js( data.root_prefix+'js/jquery.min.js', function() {
		window.jQomp = jQuery.noConflict(true);

		LazyLoad.js([ data.root_prefix+'js/pushstream.js',
		    data.root_prefix+'js/jquery.gritter.min.js',
		    data.root_prefix+'js/identify.js'
		], function() {
			LazyLoad.js( data.root_prefix+'js/main.js', function(){ 
				jQomp(omp_main);
			});
		}
	    );

	});

	LazyLoad.css( data.root_prefix+'css/jquery.gritter.css');

}
