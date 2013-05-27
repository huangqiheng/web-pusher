function omp_main() 
{
    jQomp.ajax({
		url: root_prefix+'omp.php?cmd=hbeat',
        dataType: 'json',
        crossDomain: true,
        xhrFields: { withCredentials: true }
    }).success(function(m) {
        var device_id = m.device;
        push_routine(device_id); 
        report_user_name(device_id);
    });
}

function mylog(msg)
{
    window.console && console.log(msg);
}

function push_routine(device_id) 
{
    PushStream.LOG_LEVEL = window.push_loglevel;

    var pushstream = new PushStream({
	host: window.push_server,
        port: window.location.port,
        modes: window.push_modes
    });

    pushstream.onmessage = function (eventMessage) {
        if (eventMessage != '') {
            var cmdbox = jQomp.parseJSON(eventMessage);

            jQomp.extend(jQomp.gritter.options, { 
                position: cmdbox.position,
            });

            jQomp.gritter.add({
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

    pushstream.onstatuschange = function (state) {
        if (state == PushStream.OPEN) {
            mylog('omp online now');
        } else {
            mylog('omp offline now');
        }
    };

    (function (channel) {
        pushstream.removeAllChannels();
        try {
            pushstream.addChannel(channel);
            pushstream.connect();
        } catch(e) {mylog(e)};
    })(device_id);
}
