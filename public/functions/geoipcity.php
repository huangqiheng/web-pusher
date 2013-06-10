<?php
require_once('geoipcity.inc.php');

//ini_set("memory_limit","96M");

//最简单的函数只要这一个
function get_ip_record($user_ip) {
 
    global $path_visitor_maps;
 
    //假定 GeoLiteCity.data 放在与此文件同一目录下
    $gi = geoip_open_VMWO(__DIR__.'/GeoLiteCity.dat', VMWO_GEOIP_STANDARD);
 
    $record = geoip_record_by_addr_VMWO($gi, "$user_ip");
    geoip_close_VMWO($gi);
 
    //你可以直接使用上面取出的 $record 数据
    return $record;
}
 
function get_location_info($user_ip) 
{
    $record = get_ip_record($user_ip);
 
    //或者使用下面加工后的 $location_info
    global $GEOIP_REGION_NAME;
    $location_info = array();    // Create Result Array
 
    $location_info['city_name']    = (isset($record->city)) ? $record->city : '';  //城市
    $location_info['state_name']   = (isset($record->country_code) && isset($record->region)) //州名
          ? @$GEOIP_REGION_NAME[$record->country_code][$record->region] : '';
    $location_info['state_code']   = (isset($record->region)) ? strtoupper($record->region) : ''; //州代号
    $location_info['country_name'] = (isset($record->country_name)) ? $record->country_name : '--'; //国家名
    $location_info['country_code'] = (isset($record->country_code)) ? strtoupper($record->country_code) : '--'; //国家代号
    $location_info['latitude']     = (isset($record->latitude)) ? $record->latitude : '0';   //维度
    $location_info['longitude']    = (isset($record->longitude)) ? $record->longitude : '0'; //经度
 
    //php 站点设置了 utf-8 字符集必要时进行转码
    $charset = 'utf-8';
    // this fixes accent characters on UTF-8, only when the blog charset is set to UTF-8
    if ( strtolower($charset) == 'utf-8' && function_exists('utf8_encode') ) {
        if ($location_info['city_name'] != '' ) {
            $location_info['city_name'] = utf8_encode($location_info['city_name']);
        }
        if ($location_info['state_name'] != '') {
            $location_info['state_name'] = utf8_encode($location_info['state_name']);
        }
        if ($location_info['country_name'] != '') {
            $location_info['country_name'] = utf8_encode($location_info['country_name']);
        }
    }
 
    return $location_info;
}

function get_city_name($user_ip)
{
	$location = get_location_info($user_ip);
	return $location['city_name'];
}

?>
