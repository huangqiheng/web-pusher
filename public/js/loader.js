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

		window.root_prefix = 'http://dynamic.appgame.com/';
		window.pusher_server = 'dynamic.appgame.com';

		load_script(window.root_prefix+'js/head.min.js', function(){
			head.js(
				window.root_prefix+'js/jquery.min.js',
				window.root_prefix+'js/pushstream.js', 
				window.root_prefix+'js/jquery.gritter.js', 
				window.root_prefix+'css/jquery.gritter.css', 
				window.root_prefix+'js/identify.js', 
				window.root_prefix+'js/main.js', 
				function(){omp_main();});
		});
	})()
}


