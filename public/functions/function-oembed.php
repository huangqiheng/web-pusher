<?php
//直接复制自：https://github.com/huangqiheng/oembed-appgame/blob/master/function-oembed.php

require_once 'nokogiri.php';

define('ERROR_NAME', '_ERROR');
define('UA_ONEBOX', 'curl-onebox');

function fast_by_pass($post)
{
	if (preg_match( "#<a href=\"https?://#s", $post)) {
		return false;
	}
	return true;
}

function process_post_by_display($post) 
{
	//里面没有链接的，bypass
	if (fast_by_pass($post)) {
		return $post;
	}

	//这个请求是来自本代码curl发出的，bypass
	$user_agent = $_SERVER['HTTP_USER_AGENT'];
	if (strpos($user_agent, UA_ONEBOX) !== false) {
		return remove_bbs_appgame_link($post);
	}

	$post = process_itunes_link($post);
	$post = process_appgame_link($post);
	$post = process_bbs_appgame_link($post);
	return $post;
}

$regex_bbs = array(
	"#<a href=\"(http://bbs\.appgame\.com/forum\.php\?mod=(redirect)&amp;goto=findpost&amp;ptid=(\d+)&amp;pid=(\d+))\"[\s\S]+?</a>#us",
	"#<a href=\"(http://bbs\.appgame\.com/forum\.php\?mod=(redirect)&amp;goto=findpost&amp;ptid=(\d+)&amp;pid=(\d+)&amp;fromuid=(\d+))\"[\s\S]+?</a>#us",
	"#<a href=\"(http://bbs\.appgame\.com/forum\.php\?mod=(viewthread)&amp;tid=(\d+)&amp;fromuid=\d+?)\"[\s\S]+?</a>#us",
	"#<a href=\"(http://bbs\.appgame\.com/thread-(\d+)-(\d+)-(\d+)\.html)\"[\s\S]+?</a>#us"
	);

function remove_bbs_appgame_link($post)
{
	global $regex_bbs;
	return preg_replace($regex_bbs, "", $post);
}

function process_bbs_appgame_link($post)
{
	global $regex_bbs;
	return preg_replace_callback($regex_bbs, 'embed_bbs_appgame_callback', $post);
}

function is_mobile() 
{
	return ($_GET['ordertype'] == 2);
}

function get_savename($ori_url)
{
	if (is_mobile()) {
		return ($ori_url.'_mobile');
	} else {
		return $ori_url;
	}
}

function embed_bbs_appgame_callback( $match )
{
	$ori_url =  $match[1];
	$ori_url = preg_replace("#amp;#", "", $ori_url);
	
	$save_name = get_savename($ori_url);

	if ($res = get_cache_data($save_name)) {
		return $res;
	}

	if ($res = get_cache_data($save_name.ERROR_NAME)) {
		return $res;
	}

	$pid = null;
	if ($match[2] == 'redirect') {
		$pid = $match[4];
	} 

	$mobile = is_mobile();
	$return = get_bbspage_form_url($ori_url, $pid, $mobile);

	if ($return) {
		put_cache_data($save_name, $return);
		error_log('new done: '.$ori_url.' from '.$_SERVER['REQUEST_URI']);
	} else {
		//错误？需要通知相关人等
		put_cache_data($save_name.ERROR_NAME, $return);
		error_log('not done: '.$ori_url.' from '.$_SERVER['REQUEST_URI']);
	}

	return $return;
}

function get_bbspage_form_url($ori_url, $pid, $mobile=false)
{
	$user_agent = null;
	$user_agent = 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3 '.UA_ONEBOX;

	$html = do_curl($ori_url, $user_agent);

	if (empty($html)) {
		return null;
	}

	if (empty($pid)) {
		$regex_match = "#<div id=\"post_(\d+)\" class=\"vb (vc|notb)\">#s";

		if (!preg_match($regex_match, $html, $match)) {
			if (preg_match("#class=\"alert_info\".*?(<p>[^<].*?</p>)#s", $html, $match)) {
				return onebox_capsule($ori_url, 'not found', $match[1], 50);
			}
			return null;
		}
		$pid = $match[1];
	}


	preg_match("#<title>([^<]*?)</title>#s", $html, $match);
	$title = $match[1];
	$title = preg_replace("#_[^_]+_任玩堂#u", '', $title);
	$size = 65;

	//return "<a href=$ori_url target=\"_blank\">$title</a>"; 

	$html= mb_convert_encoding($html, 'HTML-ENTITIES', mb_detect_encoding($html));
	$id_nokorigi = 'div[id=postmessage_'.$pid.']';
	$saw = new nokogiri($html);
	$target = $saw->get($id_nokorigi);
	$dom = $target->getDom();
	$node = $dom->firstChild->childNodes->item(0); 
	$content = node_to_html($node);

	$content = clean_tags($content);

	return onebox_capsule($ori_url, $title, $content, $size);
}

function clean_tags($content) 
{
	$content = preg_replace("#<i class=\"pstatus\">.*?</i>#us", '', $content);
	$content = preg_replace("#[\s]+#us", '', $content);
	$content = strip_tags($content);
	$content = trim($content);

	if (mb_strlen($content) > 144) {
		$content = mb_substr($content, 0, 143, 'utf-8');
	}

	return $content;
}

function remove_trouble_tags_mobile($html)
{
	$html = preg_replace_callback("#<img[^>]*?>#us", 'cut_images_but', $html);
	$html = preg_replace("#<br>#us", "", $html);
	$html = preg_replace("#<font[^>]+>#us", "<font>", $html);
	$html = preg_replace("#<i class=\"pstatus\">.*?</i>#us", '', $html);
	$html = preg_replace("#<script.*?</script>#us", '', $html);
	$html = preg_replace("#<div[^>]+>#us", '<div>', $html);
	$html = preg_replace("#<a href=[^>]+>[^<]*</a>#us", '', $html);
	$html = preg_replace("#[\s]+#us", '', $html);
	return $html;
}

function __get_bbspage_form_url($ori_url, $pid, $mobile=false)
{
	$user_agent = null;
	if ($mobile) {
		$user_agent = 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3 '.UA_ONEBOX;
	} else {
		$user_agent = 'User-Agent: '.UA_ONEBOX;
	}

	$html = do_curl($ori_url, $user_agent);

	if (empty($html)) {
		return null;
	}

	if (empty($pid)) {
		if ($mobile) {
			$regex_match = "#<div id=\"post_(\d+)\" class=\"vb (vc|notb)\">#s";
		} else {
			$regex_match = "#<table id=\"pid(\d+)\" summary=\"pid(\d+)\"#s";
		}

		if (!preg_match($regex_match, $html, $match)) {
			if (preg_match("#class=\"alert_info\".*?(<p>[^<].*?</p>)#s", $html, $match)) {
				return onebox_capsule($ori_url, 'not found', $match[1], 50);
			}
			return null;
		}
		$pid = $match[1];
	}

	if ($mobile) {
		$id_nokorigi = 'div[id=post_'.$pid.']';

		preg_match("#<title>([^<]*?)</title>#s", $html, $match);
		$title = $match[1];
		$title = preg_replace("#_[^_]+_任玩堂#u", '', $title);
		$size = 120;

	} else {
		$id_nokorigi = 'table[id=pid'.$pid.']';

		preg_match("#id=\"thread_subject\">([^<]*?)</a>#s", $html, $match);
		$title = $match[1];
		$size = 140;
	}

	//return "<a href=$ori_url target=\"_blank\">$title</a>"; 

	$html= mb_convert_encoding($html, 'HTML-ENTITIES', mb_detect_encoding($html));
	$saw = new nokogiri($html);
	$target = $saw->get($id_nokorigi);
	$dom = $target->getDom();
	remove_doc_class($dom, 'plm xg2 tip mbm cl p_pop md_ctrl pattl ad authi pi postatt box_ex2 user_first');
	$node = $dom->firstChild->childNodes->item(0); 
	$content = node_to_html($node);
	$content = remove_trouble_tags($content);

	return onebox_capsule($ori_url, $title, $content, $size);
}

function onebox_capsule($ori_url, $title, $content, $size=180)
{
	//$html = '<div class="onebox-result" style="height: '.$size.'px; overflow-y: hidden;">';
	$html = '<div class="onebox-result">';
	$html .=   '<div class="source">';
	$html .=     '<div class="info">';
	$html .=       '<a href="'.$ori_url.'" target="_blank">';
	$html .=         '<img class="favicon" src="http://www.appgame.com/favicon.ico">';
	$html .=         "论坛引用：$title";
	$html .=       '</a>';
	$html .=     '</div>';
	$html .=   '</div>';

	$html .= '<div class="onebox-result-body">';
	$html .=   $content;
	$html .= '</div>';

	$html .= '<div class="clearfix"></div>';
	$html .= '</div><!--onebox-end-->';
	return $html;

	/*
	make_onebox_from_template(
		'http://bbs.appgame.com',
		'任玩堂论坛',
		'http://www.appgame.com/favicon.ico',
		$ori_url,
		$title,
		$image,
		$content,
		$size
	);
	*/
}

function remove_trouble_tags($html)
{
	$html = preg_replace_callback("#<img[^>]*?>#us", 'cut_images_but', $html);
	$html = preg_replace("#<p>签到天数.*?</p>#us", '', $html);
	$html = preg_replace("#<p>\[LV\..*?</p>#us", '', $html);
	$html = preg_replace("#<br>#us", "", $html);
	$html = preg_replace("#[\s]+#us", ' ', $html);
	$html = preg_replace("#<font[^>]+>#us", "<font>", $html);
	$html = preg_replace("#<i class=\"pstatus\">.*?</i>#us", '', $html);
	$html = preg_replace("#<script.*?</script>#us", '', $html);
	$html = preg_replace("#<div[^>]+>#us", '<div>', $html);
	$html = preg_replace("#<em>.*</em>#us", '', $html);
	$html = preg_replace("#<h1 class=\"vt_th\">[^<]*<a[^>]+>[^<]+</a>[^<]+</h1>#us", '', $html);
	return $html;
}

function cut_images_but($matchs)
{
	if (preg_match("#avatar\.php#i", $matchs[0])) {
		return $matchs[0];
	}
	if (preg_match("#favicon\.ico#i", $matchs[0])) {
		return $matchs[0];
	}
	if (preg_match("#qs\.qlogo\.cn#i", $matchs[0])) {
		return $matchs[0];
	}
	return null;
}

function remove_doc_class($doc, $class_names)
{
	$matched = get_elements_by_classname($doc, $class_names);

	foreach($matched as $node) {
		$node->parentNode->removeChild($node);
	}
}

function get_elements_by_classname(DOMDocument $document, $class_names)
{
	$elements = $document->getElementsByTagName("*");
	$matched = array();

	foreach($elements as $node)
	{
		if( ! $node->hasAttributes())
			continue;

		$classAttribute = $node->attributes->getNamedItem('class');

		if( ! $classAttribute)
			continue;

		$classes = explode(' ', $classAttribute->nodeValue);
		$__class_names = explode(' ', $class_names);

		foreach($__class_names as $class_name)
		{
			if(in_array($class_name, $classes))
			{
				$matched[] = $node;
				break;
			}
		}
	}

	return $matched;
}

function node_to_html($node)
{
	$doc = new DOMDocument();
	$doc->appendChild($doc->importNode($node,true));
	return mb_convert_encoding($doc->saveHTML(),'UTF-8','HTML-ENTITIES');
}

function process_appgame_link($post)
{
        $regex_appgame = array( 
                "#<a href=\"((http://ol\.appgame\.com/[a-zA-Z0-9\-]+/)([a-zA-Z0-9\-]+/)*?[\d]+\.html)[\s\S]+?</a>#i",
                "#<a href=\"((http://(www\.)?appgame\.com/zt/[a-zA-Z0-9\-]+/)(.+)?(?:\?p=[\d]+|[\d]+\.html))[\s\S]+?</a>#i",
                "#<a href=\"((http://([a-zA-Z0-9\-]+\.)*appgame\.com/)((?:archives|app)/)?[\d]+\.html)[\s\S]+?</a>#i"
                );

	return preg_replace_callback( $regex_appgame, 'oembed_appgame_callback', $post);
}

function oembed_appgame_callback( $match )
{
	$ori_url =  $match[1];
	$api_prefix = $match[2];
	return get_appgame_oembed_content($api_prefix, $ori_url);
}

function get_cache_file_name($key)
{
	$search = array(':','.',',',';','/','|','?','&','#','@','!','+','=');
	$url_file = str_replace($search, '-', $key);
	return "app/cache-".$url_file.".txt";
}

function get_cache_data($ori_url)
{
	$appfile = get_cache_file_name($ori_url);

	if (!file_exists($appfile)) {
		return null;
	}

	return file_get_contents($appfile);
}

function put_cache_data($key, $data)
{
	if (empty($data) || empty($key)) {
		return null;
	}

	$appfile = get_cache_file_name($key);

	$fhandler = fopen($appfile, 'a');
	if ($fhandler && fwrite($fhandler, trim($data))) {
		fclose($fhandler);
	}
	return $data;
}

function get_appgame_oembed_content($api_prefix, $ori_url)
{
	if ($res = get_cache_data($ori_url)) {
		return $res;
	}

	if ($res = get_cache_data($ori_url.ERROR_NAME)) {
		return $res;
	}

	$can_save = false;
	$res_body = get_oembed_from_api ($api_prefix, $ori_url);
	$return = make_oembed_template ($res_body, $ori_url, $can_save);

	if ($can_save) {
		put_cache_data($ori_url, $return);
		error_log('new done: '.$ori_url.' from '.$_SERVER['REQUEST_URI']);
	} else {
		put_cache_data($ori_url.ERROR_NAME, $return);
		//资料不全？需要通知相关人等
		error_log('not done: '.$ori_url.' from '.$_SERVER['REQUEST_URI']);
	}

	return $return;
}       

function do_curl($url, $user_agent=null)
{
	$headers = array(
		"Accept: application/json",
		"Accept-Encoding: deflate,sdch",
		"Accept-Charset: utf-8;q=1"
		);

	if ($user_agent) {
		$headers[] = $user_agent;
	}

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
	curl_setopt($ch, CURLOPT_TIMEOUT, 3);

	$res = curl_exec($ch);
	$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$err = curl_errno($ch);
	curl_close($ch);

	if (($err) || ($httpcode !== 200)) {
		return null;
	}

	return $res;
}

function get_oembed_from_api ($api_prefix, $ori_url)
{
	if (empty($api_prefix) || empty($ori_url)) {
		return null;
	}

	//任玩堂的oEmbed的api格式
	$api_regex = "%s?oembed=true&format=json&url=%s";
	$api_url = sprintf($api_regex, $api_prefix, $ori_url);

	$res = do_curl($api_url);

	if (empty($res)) {
		return null;
	}

	preg_match("#{\".*\"}#ui", $res, $mm);
	$res_body = $mm[0];

	if (empty($res_body)) {
		return null;
	}

	return $res_body;
}

function remove_html_tag($content)
{
	$ori_content = $content;

	//去掉html标签先
	$ori_content = preg_replace("#<([^<>].*|(?R))*>#", "", $ori_content);

	if (empty($ori_content)) {
		$content = preg_replace("#<.*>#", "", $content);
	} else {
		$content = $ori_content;
	}

	//截取为最大限制长度
	if (mb_strlen($content) > 255) {
		$content = mb_substr($content, 0, 255);
	}
	return $content;
}

function make_oembed_template ($res_body, $ori_url, &$can_save)
{
	if (empty($res_body)) {
		return null;
	}

	$data = json_decode($res_body);

	if (empty($data)) {
		return null;
	}

	$favicon_url = "http://www.appgame.com/favicon.ico";
	$provider_name = $data->provider_name;
	$provider_url  = $data->provider_url;
	$image = $data->thumbnail_url;
	$title = $data->title;
	$content = $data->html;
/*
	//截断过长的html内容
        mb_internal_encoding("UTF-8");

	if (mb_strlen($content) > 255) {
		$content = remove_html_tag($content);
	}
*/

        mb_internal_encoding("UTF-8");
	$content = clean_tags($content);

	//构造html模板
	$html = make_onebox_from_template(
		$provider_url,
		$provider_name,
		$favicon_url,
		$ori_url,
		$title,
		$image,
		$content
		);

	$can_save = ($image && $title && $content);

	return $html;
}

function make_onebox_from_template(
		$provider_url,
		$provider_name,
		$favicon_url,
		$ori_url,
		$title,
		$image,
		$content,
		$size=0
		)
{
	if ($size == 0) {
		$html  = "<div class=\"onebox-result\">";
	} else {
		$html  = "<div class=\"onebox-result\" style=\"height: ".$size."px; overflow-y: hidden;\">";
	}

	$html .=   "<div class=\"source\">";
	$html .=     "<div class=\"info\">";
	$html .=       '<a href="'.$provider_url.'" target="_blank">';
	$html .=         "<img class=\"favicon\" src=$favicon_url>$provider_name";
	$html .=       "</a>";
	$html .=     "</div>";
	$html .=   "</div>";

	$html .=   "<h3>";
	$html .=     "<a href=$ori_url target=\"_blank\" class=\"onebox-title\">$title</a>";
	$html .=   "</h3>";

	$html .=   "<div class=\"onebox-result-body\">"; if ($image) {
	$html .=     "<a href=$ori_url target=\"_blank\"><img src=$image class=\"thumbnail\"></a>";}
	$html .=     $content;
	$html .=   "</div>";
	$html .=   "<div class=\"clearfix\"></div>";
	$html .= "</div>";
	return $html;
}

function process_itunes_link($post) 
{
	preg_match_all("/<a href=\"(http|https):\/\/itunes.apple.com(\S*)\/app\S*\/id(\d+)(\?mt\=\d+){0,1}[\s\S]+<\/a>/i", $post, $matches);
	
	if ($matches == null || $matches[0] == null) {
		return $post;
	}
	
	for ($i=0; $i< count($matches[0]); $i++) {
		$link = $matches[0][$i];
		$protocol = $matches[1][$i];
		$country = $matches[2][$i];
		if ($country == null || $country == "") {
			$country = "us";
		} else {
			$country = substr($country, 1, 2);
		}
		$appid = $matches[3][$i];
		
		$appfile = "app/".$appid."_".$country.".txt";
		if (!file_exists($appfile)) {
			
			$pageContents = file_get_contents("http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/wa/wsLookup?id=" . $appid . "&country=" . $country);
			
			if ($pageContents != null && trim($pageContents) != "") {
				// 写缓存
				$fhandler = fopen($appfile, 'a');
				if ($fhandler && fwrite($fhandler, trim($pageContents))) {
					fclose($fhandler);
				}
				
				return str_replace($link, process_link($link) . get($pageContents, $country), $post);
			}
			
			break;
		}
		
		return str_replace($link,  get(file_get_contents($appfile), $country) . process_link($link), $post);
	}
	return $post;
}


function process_link($link) 
{
	preg_match_all("/\"(http|https):\/\/itunes.apple.com(\S*)\/app\S*\/id(\d+)(\?mt\=\d+){0,1}[^\"]*\"/i", $link, $matches);
	
	if ($matches == null || $matches[0] == null) {
		return $link;
	}
	
	return str_replace($matches[0][0], "\"" . get_url(substr($matches[0][0], 1, strlen($matches[0][0])-2)) . "\"", $link);
}

function get_url($url) 
{
	$n_url = $url . "&partnerId=30";
	
	return "http://click.linksynergy.com/fs-bin/stat?id=pSekzAypeyg&offerid=146261&type=3&subid=0&tmpid=1826&RD_PARM1=" . urlencode(urlencode($n_url));
}


function get($appcontent, $country) 
{
	//$apps_con = file_get_contents("http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/wa/wsLookup?id=".$appid."&country=".$country);
	
	$obj = json_decode($appcontent);
	$apps_array = $obj->{"results"}[0];
	//$app['a']['app_id']= $appid;
	
	$view_url = get_url($apps_array->{'trackViewUrl'});
	
	//$view_url = $apps_array->{'trackViewUrl'};
	$app_name = $apps_array->{'trackName'};
	$app_logo = substr($apps_array->{'artworkUrl512'},0,-4).'.175x175-75.jpg';
	$app_logo = str_replace('.512x512-75','',$app_logo);
	
	$sign = $country == "cn" || $country == "jp" ? "￥" : "$";
	
	$app_price = ($apps_array->{'price'}=='0'||$apps_array->{'price'}=='0.00')?'Free':$sign.$apps_array->{'price'}."（" . $country . "）";
	$order   = array("\r\n", "\n", "\r");
	$replace = '<br />';
	$app_description = str_replace($order, $replace, $apps_array->{'description'});
	//$app_version = $apps_array['version'];
	//$cpn_id = $apps_array['artistId'];
	//$app_category = $apps_array['primaryGenreName'];
	//$app_rating = $apps_array['trackContentRating'];
	//$app_current_rating_count = $apps_array['userRatingCount'];
	$app_screenshots = array_merge($apps_array->{'screenshotUrls'},$apps_array->{'ipadScreenshotUrls'});
	//$app_releaseDate = date('Y-m-d',strtotime($apps_array['releaseDate']));
	$app_language = implode(',',$apps_array->{'languageCodesISO2A'});
	
	
	$features = $apps_array->{"features"};
	$str_features = "";
	$c = 0;
	if ($features != null) {
		$c = count($features);
	}
	for ($i = 0; $i < $c; $i++) {
		$str_features .= $features[$i];
		if ($i < $c - 1) {
			$str_features .= "|";
		}
	}
	$devices = $apps_array->{"supportedDevices"};
	$str_devices = "";
	$c = 0;
	if ($devices != null) {
		$c = count($devices);
	}
	for ($i = 0; $i < $c; $i++) {
		$str_devices .= $devices[$i];
		if ($i < $c - 1) {
			$str_devices .= "|";
		}
	}
	
	$device = "";
	$str = strtolower($str_devices);
	if (!(strpos($str_features, "iosUniversal") === false)) {
		$device = "通用版";
	} else if ($str == "all" || !(strpos($str, "iphone") === false)) {
		$device = "iPhone";
	} else if (!(strpos($str, "ipad") === false)) {
		$device = "iPad";
	}
	
	if ($device == "") {
		$str = strtolower($apps_array->{"kind"});
		if (!(strpos($str, "mac") == false)) {
			$device = "Mac";
		}
	}
	if ($device == "") {
		$device = "iPhone";
	}
	
	//$app_devices = implode(',',$apps_array->{'supportedDevices'});
	//$primaryGenreId = $apps_array['primaryGenreId'];
	$app_size = number_format($apps_array->{'fileSizeBytes'}/1024/1024, 2, '.', '').'M';
	$seller_name = $apps_array->{'sellerName'};
	
	$screenhots = "";
	
	$i = 0;
	foreach ($app_screenshots as $key=>$v) {
		if ($i >= 4) {
			break;
		}
		$key++;
		$i++;
		$v = substr($v, 0, -3) . ($device == "iPad" ? "480x480" : "320x480") . "-75.jpg";
		$v = str_replace('.1024x1024-65','',$v);
		$screenhots .= "<a href='$v' target='_blank'><img src='$v' alt='$app_name - Screen shot-$key' /></a>";
	}
	global $it_index;
	if (!isset($it_index)) {
		$it_index = 1;
	} else {
		$it_index += 1;
	}
$content = <<<EOT
<div class="bbs_appshow">
	<div class="appshow_title">$app_name</div>
	<div class="appshow_des" id="thecon$it_index" style="height:180px;overflow-y:hidden;">
		<a href='$view_url' title='前往iTunes下载' target='_blank'>
		<img src='$app_logo' alt='$app_name' />
		</a>
		$app_description
	</div>
	<a href="javascript:void(0)" id="show$it_index" style="display:block" onclick="document.getElementById('thecon$it_index').style.height='100%';document.getElementById('hidden$it_index').style.display='block';document.getElementById('show$it_index').style.display='none';">显示全部</a>
	<a href="javascript:void(0)" id="hidden$it_index" style="display:none;" onclick="document.getElementById('thecon$it_index').style.height='180px';document.getElementById('hidden$it_index').style.display='none';document.getElementById('show$it_index').style.display='block';">隐藏部分</a>
	<div class="appshow_screen">$screenhots</div>
	<div class="appstyle_container">
	<div class="appstyle_container2">
		<div class="appstyle_logo"><div class="appstyle-logomask"><img src="http://www.appgame.com/source/rating/app-style-logocover.png" alt="itunes logo mask" /></div><div class="appstyle-logoimg"><img src='$app_logo' alt='$app_name' style="width:72px;height:72px;" /></div></div>
		<div class="appstyle_button">
		<span class="appstyle_newprice">$app_price</span><br /><a href='$view_url' target="_blank" title="前往App Store下载"><img src="http://www.appgame.com/source/rating/app-style-download.jpg" alt="Download" /></a>
		</div>
		<div class="appstyle_des">
            	<span class="appstyle_name">$app_name</span><br />
                适用设备 &nbsp; <span class="appstyle_time">$device</span><br />
            	发行厂商 &nbsp; <span class="appstyle_size">$seller_name</span><br />
            	软件大小 &nbsp; <span class="appstyle_size">$app_size</span><br />
		</div>
		<div class="appstyle-clear"></div>    
	</div>
	</div>
</div>
EOT;
	
	return $content;
}
?>
