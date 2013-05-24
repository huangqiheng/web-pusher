function report_user_name(device_id)
{
    var id_obj = get_user_name();

    if (!id_obj.hasOwnProperty('username')) {
        mylog("cant obtain username. not binding.");
    } else {
		if (id_obj['username'] != '') {
				bind_device_user(device_id, id_obj);
		}
    }

    var disqus_thread = jQomp('div#disqus_thread');
    if (disqus_thread.length > 0) {
    	disqus_report(device_id);
    }
}

function disqus_report(device_id)
{
    if (window.location.hostname.match(new RegExp("appgame.com", 'i'))) {
		jQomp.getJSON("http://bbs.appgame.com/disqus_helper.php?action=disqus_auth&callback=?")
			.success(function (d) {
				head.js( root_prefix+'js/jquery.base64.min.js', function() {
					var remote_auth_s3 = d.remote_auth_s3;
					var userdata = remote_auth_s3.split(' ')[0];
					userdata = jQomp.base64.decode(userdata);
					userdata = JSON.parse(userdata);

					if (userdata.hasOwnProperty('username')) {
						var id_obj = {};
						id_obj['name'] = 'disqus';
						id_obj['caption'] = '评论';
						id_obj['username'] = userdata.username;
						id_obj['nickname'] = '';
						bind_device_user(device_id, id_obj);
					} else {
/*
						jQomp(window).load(function() {
							mylog(jQomp('iframe#dsq1 button.btn'));
							var iframe_url = jQomp("iframe#dsq1").attr('src');
							var api_key = 'g9aqXm6UQHwiSn0lFuiq5pYNPSB8eJfZCcBx16KCuLcQ2i52u1NY9IFiMIvm0u73';
							var api_url = 'http://disqus.com/api/3.0/users/details.jsonp?user=1';
							jQomp.getJSON(api_url+'&api_key='+api_key+'&callback=?', 
								function (m) {
								mylog(m);
							});

							mylog(iframe_url);
						});
*/
					}
				});
			});
    }
}

function bind_device_user(device_id, id_obj)
{
    jQomp.post(root_prefix+'omp.php', {
        cmd:'bind',
        plat: id_obj.name,
        device: device_id,
        cap: id_obj.caption,
        user: id_obj.username,
        nick: id_obj.nickname
    })
    .success(function () {
        mylog('bind ok: -- dev_id:' + device_id + ' username:' + id_obj.username + " nickname: " + id_obj.nickname);
    });
}

function get_user_name()
{
    var id_obj = {};
    var travers_seletors = function(sel) {
        var result = '';
        jQomp.each(sel, function() {
            var target = jQomp(this.selector), text = '';
            if (target.length === 0) return true; //skip,

            if (this.hasOwnProperty('revisor') && typeof this.revisor === 'function') {
                text = this.revisor(target);
            } else {
                text = target.text().trim();
            }

            result = text;
            return false; //break
        });
        return result;
    };

    jQomp.each(username_selector, function() {
        if (!window.location.hostname.match(new RegExp(this.host, 'i')))
            return true;

        id_obj['name'] = this.name;
        id_obj['caption'] = this.caption;
        id_obj['username'] = travers_seletors(this.filters.username);
        id_obj['nickname'] = travers_seletors(this.filters.nickname);

        return false;
    });

    return id_obj;
}

var username_selector = [
{
    'name':'bbs-appgame',
    'caption':'论坛',
    'host':"bbs.appgame.com",
    'filters':{
        username: [{selector:"div#um strong.vwmy a:first",}],
        nickname: []
    }
}
,
{
    'name':'appgame',
    'caption':'任玩堂',
    'host':"appgame.com",
    'filters':{
        username: [{selector:"a span.username",}],
        nickname: [{selector:"a span.display-name",}]
    }
}
/*
,
{
    'name':'',
    'caption':'',
    'host':'',
    'filters':{
        username: [
            {'selector':"", 'revisor': function (str) {return str;}}
        ],
        nickname: []
    }
}
*/

];

