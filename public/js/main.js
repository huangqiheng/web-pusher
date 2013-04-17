
function omp_main() 
{
	var xhr = new XMLHttpRequest();  
	xhr.open("GET", "http://omp.cn/device/get?host="+window.location.hostname, true);  
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4 && xhr.status == 200)
		{
			push_routine(xhr.responseText); 
		}
	}
	xhr.withCredentials = true; 
	xhr.send();
}

function log(msg)
{
	window.console&&console.log(msg);
}

function push_routine(device_id) 
{
	log('start push_routine')
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
			log('omp online now');
		} else {
			log('omp offline now');
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
