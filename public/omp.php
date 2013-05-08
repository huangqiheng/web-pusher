<?php
require_once 'memcache_array.php';
require_once 'config.php';
require_once 'functions.php';

$PARAMS = get_param();
$in_cmd      = @$PARAMS[ 'cmd' ]; // hbeat | bind | reset

$http_referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
$ref_obj = ($http_referer)? parse_url($http_referer) : null;
header('Access-Control-Allow-Origin: '.($ref_obj? ($ref_obj['scheme'].'://'.$ref_obj['host']) : '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');

switch($in_cmd) {
    case 'hbeat':
        echo handle_heartbeat_cmd();
        break;
    case 'bind':
        echo handle_bind_device();
        break;
    case 'reset':
        echo handle_reset();
        break;
    default:
        echo 'unreconized cmd.';
}

function handle_heartbeat_cmd()
{
    session_set_cookie_params(COOKIE_TIMEOUT);
    session_start();

    if(!isset($_SESSION['DEVICE_ID'])) {
        $_SESSION['DEVICE_ID'] = $device = gen_uuid();

        $browser = get_browser(null, true);
        $browser_save = array(
            'device' => $device,
            'browser' => $browser['browser'],
            'platform' => $browser['platform'],
            'ismobiledevice' => $browser['ismobiledevice']
        );

    } else {
        $device = $_SESSION['DEVICE_ID'];
        $browser_json = mmc_array_get(NS_DEVICE_LIST, $device);
        $browser_save = json_decode($browser_json, true);
    }

    $browser_save['region'] = $_SERVER['REMOTE_ADDR'];
    $browser_save['visiting'] = @$_SERVER['HTTP_REFERER'];

    mmc_array_set(NS_DEVICE_LIST, $device, json_encode($browser_save), CACHE_EXPIRE_SECONDS);
    return $device;
}

function handle_bind_device()
{
    $device    = @$PARAMS[ 'device' ];
    $platform    = @$PARAMS[ 'plat' ];
    $caption     = @$PARAMS[ 'cap' ];
    $username    = @$PARAMS[ 'user' ];
    $nickname    = @$PARAMS[ 'nick' ];

    $ns_bind_list = NS_BINDING_LIST.$platform;

    $platform_list = mmc_array_all(NS_BINDING_LIST);
    if (!in_array($platform, $platform_list)) {
        mmc_array_set(NS_BINDING_LIST, $platform, $caption);
    }

    $bind_info_json = mmc_array_get($ns_bind_list, $device);

    $bind_info = array();
    if (!empty($bind_info_json)) {
        $bind_info = json_decode($bind_info_json, true);
    }

    $changed = false;

    if ($username) {
        if ($bind_info['username'] != $username) {
            $bind_info['username'] = $username;
            $changed = true;
        }
    }
    if ($nickname) {
        if ($bind_info['nickname'] != $nickname) {
            $bind_info['nickname'] = $nickname;
            $changed = true;
        }
    }

    if (!$changed) {
        return 'ok';
    }

    if (mmc_array_set($ns_bind_list, $device, json_encode($bind_info))) {
        mmc_array_caption($ns_bind_list, $caption);
    }

    return 'ok';
}

function handle_reset($device)
{

}

function get_param($key)
{
    $union = array_merge($_GET, $_POST); 
    if ($key) {
        return @$union[$key];
    } else {
        return $union;
    }
}

?>
