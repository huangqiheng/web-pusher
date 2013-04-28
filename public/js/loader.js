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

		load_script('/OMPSERVER/js/head.min.js', function(){
			head.js(
				'/OMPSERVER/js/jquery.min.js',
				'/OMPSERVER/js/pushstream.js', 
				'/OMPSERVER/js/jquery.gritter.js', 
				'/OMPSERVER/css/jquery.gritter.css', 
				'/OMPSERVER/js/identify.js', 
				'/OMPSERVER/js/main.js', 
				function(){omp_main();});
		});
	})()
}


