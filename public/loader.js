if(self==top){
	(function(){
		var g=function(a){
			var d=document;
			var h=d.getElementsByTagName("head")[0] || d.documentElement;
			var j=d.createElement("script");
			j.type="text/javascript";
			j.src=a;
			h.insertBefore(j,h.firstChild);
		};
		g("/OMPSERVER/jquery.min.js");
		g("/OMPSERVER/event_emitter.js");
		g("/OMPSERVER/rocketio.js");
	})()
}


