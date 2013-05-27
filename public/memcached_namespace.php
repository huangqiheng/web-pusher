<?php
class NSMemcached extends Memcached
{
	private function ns_keyid($ns) {
		return '__ns2_'.$ns;
	}

	private function extra_key($nskey) {
		if (preg_match("/^__[\S]+_[\d]+_([\S]+$)/", $nskey, $matchs)) {
			return $matchs[1];
		}
		return null;
	}

	private function build_key($ns, $key) {
		$ns_keyid = $this->ns_keyid($ns);
		$id = 1;
		if(!$this->add($ns_keyid, $id)) {
			$id = $this->get($ns_keyid);
		}
		return '__'.$ns.'_'.$id.'_'.$key;
	}

	public function ns_flush($ns) {
		$ns_keyid = $this->ns_keyid($ns);
		if(!$this->increment($ns_keyid)) {
			$this->set($ns_keyid, 1);
		}
	}

	public function ns_getMulti($ns, $keys) {
		$new_keys = array();
		foreach ($keys as $key) {
			$new_keys[] = $this->build_key($ns, $key);
		}
	
		$outputs = array();
		$results = $this->getMulti($new_keys);

		foreach ($results as $key=>$value) {
			$ori_key = $this->extra_key($key);
			$outputs[$ori_key] = $value;
		}
		return $outputs;
	}

	public function ns_add($ns, $key, $var, $expire=0) {
		return $this->add($this->build_key($ns, $key), $var, $expire);
	}
	
	public function ns_set($ns, $key, $var, $expire=0) {
		return $this->set($this->build_key($ns, $key), $var, $expire);
	}

	public function ns_get($ns, $key) {
		return $this->get($this->build_key($ns, $key));
	}

	public function ns_replace($ns, $key, $var, $expire=0) {
		return $this->replace($this->build_key($ns, $key), $var, $expire);
	}

	public function ns_increment($ns, $key, $amount=1) {
		return $this->increment($this->build_key($ns, $key), $amount);
	}

	public function ns_decrement($ns, $key, $amount=1) {
		return $this->decrement($this->build_key($ns, $key), $amount);
	}

	public function ns_delete($ns, $key, $timeout=0) {
		return $this->delete($this->build_key($ns, $key), $timeout);
	}
}

?>
