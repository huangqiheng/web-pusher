<?php
/*********************************************************
		可修改的配置信息
*********************************************************/

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
define('COOKIE_DEVICE_SAVED', 'device_sav'); //cookie名称
define('COOKIE_DEBUG', 'device_dbg'); //cookie名称
define('COOKIE_NEW', 'device_new'); //cookie名称
define('COOKIE_TIMEOUT', 3600*24*365*100); //cookie超时时间，设一个超大的
define('COOKIE_TIMEOUT_NEW', 3600*24); //cookie超时时间
define('COOKIE_DOMAIN', 'appgame.com'); //cookie的域，保证被嵌入网站能访问得到

define('CHECKPOINT_INTERVAL', 60*3); //清理在线列表周期，不要单次清理数量太多
define('CACHE_EXPIRE_SECONDS', 60*15); //在线列表超时时间
define('SCHEDUAL_INTERVAL', 60*3); //处理任务列表

//重量级操作的memcached缓存
define('GET_BROWSER_EXPIRE', 3600*8); 
define('GET_DEVICE_EXPIRE', 3600*8);
define('GET_LOCALE_EXPIRE', 3600*8);

//文件名 配置
define('LOCAL_LOG_FILE', 'debug.log');


/*********************************************************
		下面的不用修改，为程序常量
*********************************************************/

//定期维护超时的设备列表内容
define('NS_DEVICE_LIST', 'ns_device_list'); //没必要改
define('NS_BINDING_LIST', 'ns_binding_list'); //没必要改
define('NS_BINDED_LIST', 'ns_binded_list');
define('NS_BINDED_CAPTION', 'ns_binded_caption');

//计划任务发送列表
define('SCHEDUAL_UPDATE_KEY', 'SCHEDUAL_UPDATE_KEY'); //列表被更新标记
define('DATA_SCHED_LIST', '@SCHED_LIST');
define('DATA_PLANS_LIST', '@PLANS_LIST');
define('DATA_USER_LIST', '@USER_LIST');
define('DATA_MESSAGE_LIST', '@MESSAGE_LIST');
define('DATA_POSI_LIST', '@POSI_LIST');
define('DATA_ACCNT_IDENT_LIST', '@IDENTIFY_LIST');
define('DATA_KWORD_IDENT_LIST', '@KWORD_IDENT_LIST');
define('DATA_SUBMT_IDENT_LIST', '@SUBMT_IDENT_LIST');
define('DATA_KEYWORD_LIST', '@KEYWORD_LIST');

//常量
define('CHECKPOINT_TIME_KEY', 'async_check_time'); //没必要改

//解释浏览器信息的memcached配置
define('GET_BROWSER', 'GET_BROWSER');//没必要改
define('GET_DEVICE', 'GET_DEVICE');//没必要改
define('GET_LOCALE', 'GET_LOCALE');//没必要改
define('API_MEMC_POOL', 'api_memcached_pool');//没必要改

//异步消息的命令空间
define('NS_HEARTBEAT_MESSAGE', 'ns_heartbeat_message');

//客户端跟踪标记
define('CLIENT_DEBUG', true);

//计划任务列表的缓存版本
define('KEY_SCHED_LIST', 'KEY_SCHED_LIST');
//计划任务列表的命名空间，供各个设备共享访问
define('NS_SCHED_TASKS', 'NS_SCHED_TASKS');
//计划任务单个设备的执行情况记录块
define('NS_SCHED_DEVICE', 'NS_SCHED_DEVICE');

//替换任务列表的缓存版本
define('KEY_PLANS_LIST', 'KEY_PLANS_LIST');
//替换任务列表的命名空间，供各个设备共享访问
define('NS_PLANS_TASKS', 'NS_PLANS_TASKS');
//替换任务单个设备的执行情况记录块
define('NS_PLANS_DEVICE', 'NS_PLANS_DEVICE');

define('NS_ONEBOX_CACHE', 'NS_ONEBOX_CACHE');

?>
