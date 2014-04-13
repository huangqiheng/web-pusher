<?php

define('MEMQ_POOL', 'localhost:11211');
define('MEMQ_TTL', 3600*2);

class CachedHandler extends MEMQ 
{
	public static function uni_key($item) 
	{
		if (is_array($item)) {
			$item_md5 = array_merge(array(), $item);
			array_multisort($item_md5);
			return md5(json_encode($item_md5));
		} else {
			return md5(json_encode($item));
		}
	}

	public static function is_unique_item($queue, $item) 
	{
		$mem = self::getInstance();
		$uni_key = self::uni_key($item);

		return $mem->add($queue.$uni_key, TRUE, MEMQ_TTL);
	}

	public static function is_ontime($queue, $seconds) 
	{
		$mem = self::getInstance();
		$last_time = $mem->get($queue."_ontime");	

		if ($last_time === FALSE) {
			$mem->set($queue."_ontime", time());	
			return FALSE;
		}

		if ((time() - $last_time) < $seconds) {
			return FALSE;
		}

		$mem->set($queue."_ontime", time());	
		return TRUE;
	}

	public static function queue($queue, $item, $handler, $seconds=3600) 
	{
		if (empty($item)) {
			return FALSE;
		}
		if (self::is_unique_item($queue, $item)) {
			$id = self::enqueue($queue, $item);
		}
		if (self::is_ontime($queue, $seconds)) {
			$items = [];
			while ($item = self::dequeue($queue)) {
				$items[] = $item;
			}
			if (count($items)) {
				call_user_func($handler, $items);
				return TRUE;
			}
		}
		return FALSE;
	}
}

class MEMQ 
{
	private static $mem = NULL;
	private function __construct() {}
	private function __clone() {}
	
	protected static function getInstance() 
	{
		if(!self::$mem) self::init();
		return self::$mem;
	}
	
	private static function init() 
	{
		$mem = new Memcached;
		$servers = explode(",", MEMQ_POOL);
		foreach($servers as $server) {
			list($host, $port) = explode(":", $server);
			$mem->addServer($host, $port);
		}
		self::$mem = $mem;
	}
	
	public static function is_empty($queue) 
	{
		$mem = self::getInstance();
		$head = $mem->get($queue."_head");
		$tail = $mem->get($queue."_tail");
		
		if($head >= $tail || $head === FALSE || $tail === FALSE) 
			return TRUE;
		else 
			return FALSE;
	}

	public static function dequeue($queue, $after_id=FALSE, $till_id=FALSE) 
	{
		$mem = self::getInstance();
		
		//默认只取一个元素的情况
		if($after_id === FALSE && $till_id === FALSE) {
			//取出队尾，是用来比较
			$tail = $mem->get($queue."_tail");
			//如果是队列根本就不存在，则可以直接退出
			if(($id = $mem->increment($queue."_head")) === FALSE) 
				return FALSE;
			//如果取出的队头，没有超出队尾，则完成dequeue任务退出
			if($id <= $tail) {
				return $mem->get($queue."_".($id-1));
			} else {
				//发觉根本就没有元素，则恢复刚取出的队头，以失败退出
				$mem->decrement($queue."_head");
				return FALSE;
			}
		}
		//要取多个元素了，又设置了“起始点”但没“终止点"，则将全队数据都取出，即为队尾
		else if($after_id !== FALSE && $till_id === FALSE) {
			$till_id = $mem->get($queue."_tail");	
		}
		
		//批量获取，需要ID列表
		$item_keys = array();
		for($i=$after_id+1; $i<=$till_id; $i++) 
			$item_keys[] = $queue."_".$i;
		$null = NULL;
		
		//执行批量获取
		return $mem->getMulti($item_keys, $null, Memcached::GET_PRESERVE_ORDER); 
	}
	
	public static function enqueue($queue, $item) 
	{
		$mem = self::getInstance();
		
		//获取队列ID, 入队总是从队尾进入
		$id = $mem->increment($queue."_tail");
		if($id === FALSE) {
			//如果不能得到队尾ID，则需要创建新的队尾
			if($mem->add($queue."_tail", 1, MEMQ_TTL) === FALSE) {
				//不能创建队尾，因为已经存在，这时候只需要简单加1即可
				$id = $mem->increment($queue."_tail");
				if($id === FALSE) 
					return FALSE;
			} else {
				//成功创建了队尾，ID设为1，因为是第一个元素嘛。
				$id = 1;
				//队列首次创建，所以队头也需要创建。
				$mem->add($queue."_head", $id, MEMQ_TTL);
			}
		}
		
		//按照得到的ID，存放数据
		if($mem->add($queue."_".$id, $item, MEMQ_TTL) === FALSE) 
			return FALSE;
		
		return $id;
	}
}


?>
