<?php

//设置身份认证。注释掉下面的任一行，取消身份认证
define('AUTH_ENABLE', true);
define('AUTH_REALM', 'Request to and@appgame.com'); //提示信息
define('AUTH_USER', 'AppGame'); //用户名
define('AUTH_PASS', 'appgame0721ios'); //密码

function force_login()
{
	$realm = defined('AUTH_REALM')? AUTH_REALM : null;
	$validUser = defined('AUTH_USER')? AUTH_USER : null;
	$validPass = defined('AUTH_PASS')? AUTH_PASS : null;

	if (empty($realm)) return;
	if (empty($validUser)) return;
	if (empty($validPass)) return;

	// Just a random id
	$nonce = uniqid();
	// Get the digest from the http header
	$digest = getDigest();
	// If there was no digest, show login
	if (is_null($digest)) requireLogin($realm,$nonce);

	$digestParts = digestParse($digest);

	// Based on all the info we gathered we can figure out what the response should be
	$A1 = md5("{$validUser}:{$realm}:{$validPass}");
	$A2 = md5("{$_SERVER['REQUEST_METHOD']}:{$digestParts['uri']}");

	$validResponse = md5("{$A1}:{$digestParts['nonce']}:{$digestParts['nc']}:{$digestParts['cnonce']}:{$digestParts['qop']}:{$A2}");
	if ($digestParts['response']!=$validResponse) requireLogin($realm,$nonce);
}

// This function returns the digest string
function getDigest() {

    // mod_php
    $digest = '';
    if (isset($_SERVER['PHP_AUTH_DIGEST'])) {
        $digest = $_SERVER['PHP_AUTH_DIGEST'];
    // most other servers
    } elseif (isset($_SERVER['HTTP_AUTHENTICATION'])) {

            if (strpos(strtolower($_SERVER['HTTP_AUTHENTICATION']),'digest')===0)
              $digest = substr($_SERVER['HTTP_AUTHORIZATION'], 7);
    }

    return $digest;

}

// This function forces a login prompt
function requireLogin($realm,$nonce) {
    header('WWW-Authenticate: Digest realm="' . $realm . '",qop="auth",nonce="' . $nonce . '",opaque="' . md5($realm) . '"');
    header('HTTP/1.0 401 Unauthorized');
    header("Content-type: text/html; charset=utf-8"); 
    echo 'bye!';
    die();
}

// This function extracts the separate values from the digest string
function digestParse($digest) {
    // protect against missing data
    $needed_parts = array('nonce'=>1, 'nc'=>1, 'cnonce'=>1, 'qop'=>1, 'username'=>1, 'uri'=>1, 'response'=>1);
    $data = array();

    preg_match_all('@(\w+)=(?:(?:")([^"]+)"|([^\s,$]+))@', $digest, $matches, PREG_SET_ORDER);

    foreach ($matches as $m) {
        $data[$m[1]] = $m[2] ? $m[2] : $m[3];
        unset($needed_parts[$m[1]]);
    }

    return $needed_parts ? false : $data;
}

?>
