
function omp_main() 
{
	$.get('http://omp.cn/device/get', {}, push_routine);
}

function log(msg)
{
	window.console&&console.log(msg);
}

function push_routine(device_id) 
{
	PushStream.LOG_LEVEL = 'debug';
	var pushstream = new PushStream({
		host: 'omp.cn',
		port: window.location.port,
		modes: "longpolling"
	});
	pushstream.onmessage = _manageEvent;
	pushstream.onstatuschange = _statuschanged;

	function _manageEvent(eventMessage) {
		if (eventMessage != '') {
			var values = $.parseJSON(eventMessage);
			var line = values.nick + ': ' + values.text.replace(/\\r/g, '\r').replace(/\\n/g, '\n');
			Log4js.info(line);
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
