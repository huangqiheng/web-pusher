<?php
class NSMemcached extends Memcached
{
	private function ns_keyid($ns) {
		return '__ns2_'.$ns;
	}

	private function restore_key($nskey) {
		if (preg_match("/^__[\S]+_[\d]+_([\S]+$)/", $nskey, $matchs)) {
			return $matchs[1];
		}
		return null;
	}

	private function restore_keys($nskey_value) {
		$outputs = array();
		foreach ($nskey_value as $key=>$value) {
			$ori_key = $this->restore_key($key);
			$outputs[$ori_key] = $value;
		}
		return $outputs;
	}

	private function build_key($ns, $key) {
		$ns_keyid = $this->ns_keyid($ns);
		$id = 1;
		if(!$this->add($ns_keyid, $id)) {
			$id = $this->get($ns_keyid);
		}
		return '__'.$ns.'_'.$id.'_'.$key;
	}

	private function build_keyvalues($ns, $keyvalues) {
		$output = array();
		foreach ($keyvalues as $key=>$value) {
			$output[$this->build_key($ns, $key)] = $value;
		}
		return $output;
	}

	private function build_keys($ns, $keys) {
		$new_keys = array();
		foreach ($keys as $key) {
			$new_keys[] = $this->build_key($ns, $key);
		}
		return $new_keys;
	}


	public function ns_flush($ns) {
		$ns_keyid = $this->ns_keyid($ns);
		if(!$this->increment($ns_keyid)) {
			$this->set($ns_keyid, 1);
		}
	}

	public function ns_getMulti($ns, $keys) {
		$results = $this->getMulti($this->build_keys($ns, $keys));
		return $this->restore_keys($results);
	}

	public function ns_setMulti($ns, $keyvalues, $expire=0) {
		return $this->setMulti($this->build_keyvalues($ns, $keyvalues), $expire);
	}

	public function ns_deleteMulti($ns, $keys) {
		return $this->deleteMulti($this->build_keys($ns, $keys));
	}

	public function ns_cutMulti($ns, $keys) {
		$cut_keys = $this->build_keys($ns, $keys);
		$results = $this->getMulti($cut_keys);
		$output = $this->restore_keys($results);
		$this->deleteMulti($cut_keys);
		return $output;
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
