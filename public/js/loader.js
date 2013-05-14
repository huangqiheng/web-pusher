if(self==top){
	(function(){
		//bypass websites


		function load_script(url, callback){
		    var script = document.createElement("script")
		    script.type = "text/javascript";
		    if (script.readyState){  //IE
			script.onreadystatechange = function(){
			    if (script.readyState == "loaded" || script.readyState == "complete"){
				script.onreadystatechange = null;
				callback();
			    }
			};
		    } else {  //Others
			script.onload = function(){
			    callback();
			};
		    }
		    script.src = url;
		    document.getElementsByTagName("head")[0].appendChild(script);
		}

		var pre_fix = 'http://dynamic.appgame.com/';

		load_script(pre_fix+'js/head.min.js', function(){
			head.js(
				pre_fix+'js/jquery.min.js',
				pre_fix+'js/pushstream.js', 
				pre_fix+'js/jquery.gritter.js', 
				pre_fix+'css/jquery.gritter.css', 
				pre_fix+'js/identify.js', 
				pre_fix+'js/main.js', 
				function(){omp_main();});
		});
	})()
}


