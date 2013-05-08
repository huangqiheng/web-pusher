function report_user_name(device_id)
{
    var id_obj = get_user_name();

    if (!id_obj.hasOwnProperty('username'))
    {
        $(window).load(function() {
            mylog("second try match");
            report_user_name(device_id);
        });
    } else {
        bind_device_user(device_id, id_obj);
    }
}

function bind_device_user(device_id, id_obj)
{
    jQuery.post('/OMPSERVER/omp.php',
            {
                'cmd':'bind',
                'plat': id_obj.name,
                'device': device_id,
                'cap': id_obj.caption,
                'user': id_obj.username,
                'nick': id_obj.nickname
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
        jQuery.each(sel, function() {
            var text = jQuery(this.selector).text().trim();
            if(text === "") return true; //skip,
            if(this.hasOwnProperty('revisor') && typeof this.revisor === 'function') {
                text = this.revisor(text);
            }
            result = text;
            return false; //break
        });
        return result;
    };

    jQuery.each(username_selector, function() {
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
    'name':'cityspot',
    'caption':'城市热点',
    'host':"192.168.41.220",
    'filters':{
        'username': [
            {'selector':"td.navtd span:last", 'revisor': function (str) {return str.substring(0, str.length - 1);}}
        ],
        'nickname': []
    }
}

];

/*
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

{'name':'taobao',
    'caption':'淘宝网',
    'host':"taobao\\.com",
    'bypass':[],
    'contents': [".vip-head"],
    'matchs':[
        "<a class=\\\"user-nick\\\"[^>]+?>([^<]+?)()<\\/a>",
    ]},

{'name':'cityspot',
    'caption':'城市热点',
    'host':"192.168.41.220",
    'bypass':[],
    'contents': [".navtd"],
    'matchs':[
        "<span class[\\s\\S]+?\\/span>[^<]*?<span[^>]+?>([^<]+?)(): &nbsp;<\\/span>",
    ]},
    ];


*/
