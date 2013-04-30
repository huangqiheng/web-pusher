
function omp_main() 
{
	var xhr = new XMLHttpRequest();  
	xhr.open('GET', 'http://omp.cn/omp.php?cmd=hbeat', true);  
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4 && xhr.status == 200)
		{
			var device_id = xhr.responseText;
			push_routine(device_id); 
			report_user_name(device_id);
		}
	}
	xhr.withCredentials = true; 
	xhr.send();

/*
	setInterval(function(){  
		if (document.hasFocus()) {
			document.cookie='focus='+'; domain

		}
	},500); 
*/
}

function mylog(msg)
{
	window.console && console.log(msg);
}

function push_routine(device_id) 
{
	mylog('start push_routine')
	PushStream.LOG_LEVEL = 'debug';
	var pushstream = new PushStream({
		host: 'omp.cn',
		port: window.location.port,
		modes: "eventsource|longpolling"
		//modes: "stream|websocket|eventsource|longpolling"
	});
	pushstream.onmessage = _manageEvent;
	pushstream.onstatuschange = _statuschanged;

	function _manageEvent(eventMessage) {
		if (eventMessage != '') {
			var cmdbox = jQuery.parseJSON(eventMessage);

			jQuery.noConflict();
			jQuery.extend(jQuery.gritter.options, { 
				position: cmdbox.position,
			});

			jQuery.gritter.add({
				title: cmdbox.title,
				text: cmdbox.text,
				time: cmdbox.time,
				sticky: cmdbox.sticky,
				before_open: function(){
					do {
						if (!cmdbox.before_open) break;
						if (!document.hasFocus()) break;
						alert('有新消息到来');
					} while (false);
				},
			});
		}
	};

	function _statuschanged(state) {
		if (state == PushStream.OPEN) {
			mylog('omp online now');
		} else {
			mylog('omp offline now');
		}
	};

	function _connect(channel) {
		pushstream.removeAllChannels();
		try {
			pushstream.addChannel(channel);
			pushstream.connect();
		} catch(e) {alert(e)};
	}

	_connect(device_id);
}
