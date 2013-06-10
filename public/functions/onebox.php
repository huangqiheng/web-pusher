<?php
require_once 'function-oembed.php';


function make_onebox_appgame($omp_msg)
{
        $regex_appgame = array( 
                "#(^http://ol\.appgame\.com/[a-zA-Z0-9\-]+/)([a-zA-Z0-9\-]+/)*?[\d]+\.html$#i",
                "#(^http://([a-zA-Z0-9\-]+\.)*appgame\.com/)((?:archives|app)/)?[\d]+\.html$#i"
                );

	return preg_replace_callback( $regex_appgame, 'appgame_onebox_callback', $omp_msg);
}

function appgame_onebox_callback( $match )
{
	$ori_url =  $match[0];
	$api_prefix = $match[1];

	$can_save = false;
	$res_body = get_oembed_from_api ($api_prefix, $ori_url);
	$return = make_oembed_template ($res_body, $ori_url, $can_save);

	return $return;
}

?>
