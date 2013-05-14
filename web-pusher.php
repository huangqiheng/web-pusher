<?php
/**
Plugin Name: web-pusher
Plugin URI: https://github.com/huangqiheng/web-pusher.git
Description: wordpress plugin for web-pusher client installer
Author: huangqiheng
Version: 0.0.1
Author URI: https://github.com/huangqiheng
*/

//限制内部访问
if (!defined('ABSPATH')) {return ;}

//禁止多次加载include
if (!class_exists('WebPusher')) {

define('WEBPUSHER_SETTINGS', 'webpusher_settings');

/////////////////////////////////////////////////////////////////////////////
Class WebPusher
{
	/**-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
	* 初始化函数，注册一系列的回调钩子。
	*/

	function init() 
	{
		add_action('wp_head', array($this, '__wp_head'));
	}

	function __wp_head() 
	{
		return '<script type="text/javascript" src="http://dynamic.appgame.com/js/loader.js"></script></head>';
	}

	function __init() 
	{
		// web-pusher需要加载loader.js在浏览器客户端
		// 所以在这里需要嵌入到header中。
		add_action('wp_head', array('WebPusher', 'wp_head'));
		add_action('wp_footer', array('WebPusher', 'wp_footer'));

		// 注册安装的执行时机
		register_activation_hook(__FILE__, array('WebPusher', 'install'));

		if (!is_admin()) { return ;}

		// 在后台添加菜单
		add_action('admin_menu', array('WebPusher', '_menu'));
	}
	
	/**-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
	* 向wordpress输出添加的头
	*/
	function wp_head() 
	{
		return hefo::heforize(__FUNCTION__);
	}

	function wp_footer() 
	{
		return hefo::heforize(__FUNCTION__);
	}

	function heforize($tag) 
	{
		$settings = (array) get_option(WEBPUSHER_SETTINGS);
		if (isset($settings['snippets'][$tag])) {
			echo $settings['snippets'][$tag];
		}
	}

	/**-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
	* 在插件被激活的时候，可以执行一些初始化配置过程
	*/	
	function install() 
	{
		$settings = array(
			'snippets' => array(
				'wp_head' => '',
				'wp_footer' => '',
				)
			);

		if ($old_settings = get_option(WEBPUSHER_SETTINGS)) {
			update_option(WEBPUSHER_SETTINGS, array_merge($settings, $old_settings));
		} else {
			add_option(WEBPUSHER_SETTINGS, $settings);
		}
	}

	/**-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
	* 将菜单页面，添加到Options标签中
	*/
	function _menu() 
	{
		add_submenu_page('plugins.php',
			 '网页推送web-pusher配置',
			 '网页推送配置', 8,
			 __FILE__,
			 array('WebPusher', 'menu')
			);
	}
		
	function menu() 
	{
		//清理referer信息
		$_SERVER['HTTP_REFERER'] = preg_replace(
			'~&saved=.*$~Uis','', $_SERVER['HTTP_REFERER']
			);
		
		// information updated ?
		if ($_POST['submit']) {
			$_ = $_POST[WEBPUSHER_SETTINGS];
			$_['snippets'] = array_map('stripCSlashes', $_['snippets']);
			
			// save
			update_option(WEBPUSHER_SETTINGS, $_);
			die("<script>document.location.href = '{$_SERVER['HTTP_REFERER']}&saved=settings:" . time() . "';</script>");
		}

		// operation report detected
		if (@$_GET['saved']) {
			list($saved, $ts) = explode(':', $_GET['saved']);
			if (time() - $ts < 10) {
				echo '<div class="updated"><p>';
				switch ($saved) {
					case 'settings' :
						echo 'Settings saved.';
						break;
				}
				echo '</p></div>';
			}
		}

		//读取配置信息
		$settings = (array) get_option(WEBPUSHER_SETTINGS);

?>
<div class="wrap">
	<h2>HeFo: Header &amp; Footer</h2>
	<p>
	This plugin is designed to help you inject portions of HTML code (or as 
	we call them "HTML snippets") into your blog without having to modify 
	the theme you are using.
	</p>

	<form method="post">

		<label for="wp_head_html">Header:</label><br/>
		<textarea name="settings[snippets][wp_head]" style="width:90%; height:120px;"
			id="wp_head_html"><?php echo $settings['snippets']['wp_head']; ?></textarea><br/><br/>

		<label for="wp_footer_html">Footer:</label><br/>
		<textarea name="settings[snippets][wp_footer]" style="width:90%; height:120px;"
			id="wp_footer_html"><?php echo $settings['snippets']['wp_footer']; ?></textarea>

		<p class="submit" style="text-align:left;"><input type="submit" name="submit" value="Update &raquo;" /></p>
	</form>
</div>
<?php
		}
//--end-of-class
}

}

WebPusher::init();
?>
