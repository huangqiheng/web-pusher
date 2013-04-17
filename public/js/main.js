
function omp_main() 
{
	var xhr = new XMLHttpRequest();  
	xhr.open('GET', 'http://omp.cn/device/get', true);  
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
			$.gritter.add({
				title: '通知!',
				text: eventMessage
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
