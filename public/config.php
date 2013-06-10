<?php
//是否显示“来源地区”的地理位置
define('VIEW_REGION', true);

//发送消息时，需要post到下面的nginx服务器
define('PUSHER_DOMAIN', 'dynamic.appgame.com'); //nginx推送模块对外的域名
define('PUSHER_HOST', '127.0.0.1'); //填入IP地址
define('PUSHER_PORT', 80); //填入端口号

//memcached服务器配置
define('MEMC_HOST', '127.0.0.1');
define('MEMC_PORT', 11211);

//cookie相关
define('COOKIE_DEVICE_ID', 'device_id'); //cookie名称
define('COOKIE_TIMEOUT', 3600*24*365*100); //cookie超时时间，设一个超大的
define('COOKIE_DOMAIN', 'appgame.com'); //cookie的域，保证被嵌入网站能访问得到

//定期维护超时的设备列表内容
define('NS_DEVICE_LIST', 'ns_device_list'); //没必要改
define('NS_BINDING_LIST', 'ns_binding_list'); //没必要改
define('CHECKPOINT_INTERVAL', 60*3); //清理在线列表的周期，不要让单次清理的数量太多
define('CACHE_EXPIRE_SECONDS', 60*15); //在线列表超时时间

//常量
define('CHECKPOINT_TIME_KEY', 'async_check_time'); //没必要改

//解释浏览器信息的memcached配置
define('GET_BROWSER', 'GET_BROWSER');//没必要改
define('GET_BROWSER_EXPIRE', 3600*8);
define('GET_DEVICE', 'GET_DEVICE');//没必要改
define('GET_DEVICE_EXPIRE', 3600*8);
define('GET_LOCALE', 'GET_LOCALE');//没必要改
define('GET_LOCALE_EXPIRE', 3600*8);
define('API_MEMC_POOL', 'api_memcached_pool');//没必要改

define('LOCAL_LOG_FILE', 'debug.log');

define('NS_HEARTBEAT_MESSAGE', 'ns_heartbeat_message');
define('NS_BINDED_LIST', 'ns_binded_list');

?>
