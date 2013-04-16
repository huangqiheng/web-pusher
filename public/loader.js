if(self==top){
	(function(){
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

		load_script("/OMPSERVER/head.min.js", function(){
			head.js("/OMPSERVER/jquery.min.js",
				"/OMPSERVER/pushstream.js", 
				"/OMPSERVER/main.js", 
				function(){omp_main();});
		});
	})()
}


