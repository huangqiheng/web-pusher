<?php
require_once 'memcached_namespace.php';

if (!class_exists('MemcachedQue')) {

class MemcachedQue extends NSMemcached
{
	private function get_key($time, $key) {
		return time.'TIME_'.$key;
	}

	public function push($que_name, $key, $value) {

	}

	public function pops($que_name) {

	}



}

}
?>
