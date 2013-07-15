function omp_main() 
{
	jQomp.getJSON(root_prefix+'omp.php?cmd=hbeat&callback=?')
	     .success(function (omp_obj) {
			push_routine(omp_obj.device); 
			report_user_name(omp_obj);

			if (!omp_obj.hasOwnProperty('async_msg')) {return;}
			popup_message(omp_obj.async_msg);
	     });
}

function mylog(msg)
{
    window.console && console.log(msg);
}

function popup_message(eventMessage) 
{
	var cmdbox = eventMessage;
	if (typeof eventMessage === 'string') {
		if (eventMessage != '') {
            cmdbox = jQomp.parseJSON(eventMessage);
		} else {
			return;
		}
	}

	jQomp.extend(jQomp.gritter.options, { 
		position: cmdbox.position
	});

	jQomp.gritter.add({
		title: cmdbox.title,
		text: cmdbox.text,
		time: cmdbox.time,
		sticky: cmdbox.sticky==true,
		before_open: function(){
			do {
				if (!(cmdbox.before_open==true)) break;
				if (!document.hasFocus()) break;
				alert('有新消息到来');
			} while (false);
		}
	});
}
function push_routine(device_id) 
{
    PushStream.LOG_LEVEL = window.push_loglevel;

    var pushstream = new PushStream({
	host: window.push_server,
        port: window.location.port,
        modes: window.push_modes
    });

    pushstream.onmessage = popup_message;

    pushstream.onstatuschange = function (state) {
	mylog((state == PushStream.OPEN)? 'omp online now' : 'omp offline now');
    };

	//后面代码，ie在bbs有兼容问题，发帖后显示内部错误
	//暂时先忽略ie
    if (/msie/.test(navigator.userAgent.toLowerCase())) {
	    return;
    }

    (function (channel) {
        pushstream.removeAllChannels();
        try {
            pushstream.addChannel(channel);
            pushstream.connect();
        } catch(e) {mylog(e)};
    })(device_id);
}
