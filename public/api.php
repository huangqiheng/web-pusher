<?php
require_once 'memcache_array.php';
require_once 'config.php';

# 获取设备id和分类和发送
# get http://omp.cn/api.php?cmd=list&type=[device|browser|platform|mobile]
# post http://omp.cn/api.php?cmd=send&type=[device|browser|platform|mobile]&value=xxxxx

# 获取业务身份和发送
# get http://omp.cn/api.php?cmd=listplats
# get http://omp.cn/api.php?cmd=listrole&plat=tencent_qq
# post http://omp.cn/api.php?cmd=sendrole&plat=tencent_qq&username=xxxx&nickname=xxxx

?>
