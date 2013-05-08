<?php

require_once 'memcache_namespace.php';

define('LIST_NAME_KEY', 'list_name_key');
define('LIST_INDEX_PREFIX', 'list_index_');
define('LIST_DATA_PREFIX', 'list_DATA_');
define('LIST_LENGTH_KEY', 'list_length_key');
define('LIST_BYPASS_KEY', 'list_bypass_key');

function __new_index($mem, $list_name)
{
    $index = $mem->ns_increment($list_name, LIST_LENGTH_KEY, 1);
    if (empty($index)) {
        $index = 1;
        $mem->ns_set($list_name, LIST_LENGTH_KEY, $index, 0, 0);
    }
    return $index;
}

function __open_mmc()
{
    $mem = new NSMemcache();
    $mem->connect(MEMC_HOST, MEMC_PORT);
    return $mem;
}

function mmc_array_set($list_name, $key, $value, $expired=0)
{
    $mem = __open_mmc();
    $result = false;

    $ok = $mem->ns_add($list_name, LIST_DATA_PREFIX.$key, $value, 0, $expired);
    if ($ok) {
        $index = __new_index($mem, $list_name);
        $mem->ns_set($list_name, LIST_INDEX_PREFIX.$index, $key, 0, 0); 
        $result = ($index==1)? true : false;
    } else {
        $mem->ns_set($list_name, LIST_DATA_PREFIX.$key, $value, 0, $expired);
    }
    $mem->close();
    return $result;
}


function mmc_array_caption($list_name, $caption=null)
{
    $mem = __open_mmc();
    if (empty($caption)) {
        $result = $mem->ns_get($list_name, LIST_NAME_KEY);
    } else {
        $result = $mem->ns_set($list_name, LIST_NAME_KEY, $caption, 0, 0); 
    }
    $mem->close();
    return $result;
}


function mmc_array_get($list_name, $key)
{
    $mem = __open_mmc();
    $result = $mem->ns_get($list_name, LIST_DATA_PREFIX.$key);
    $mem->close();
    return $result;
}

function mmc_array_del($list_name, $key)
{
    $mem = __open_mmc();
    $mem->ns_delete($list_name, LIST_DATA_PREFIX.$key);
    $mem->close();
}

function mmc_array_all($list_name)
{
    $list = [];
    $mem = __open_mmc();
    $bypass_json = $mem->ns_get($list_name, LIST_BYPASS_KEY);
    $bypass = ($bypass_json)? json_decode($bypass_json) : [];
    $length = $mem->ns_get($list_name, LIST_LENGTH_KEY);

    for ($index=1; $index<=$length; $index++) 
    {
        if (in_array($index, $bypass)) {
            continue;
        }

        $key = $mem->ns_get($list_name, LIST_INDEX_PREFIX.$index);

        if (empty($key)) {
            continue;
        }

        if (in_array($key, $list)) { 
            $bypass[] = $index;
            continue;
        }

        $key_in_data = $mem->ns_get($list_name, LIST_DATA_PREFIX.$key);

        if (empty($key_in_data)) {
            $bypass[] = $index;
        } else {
            $list[] = $key;
        }
    }

    $bypass_json = json_encode($bypass);
    $mem->ns_set($list_name, LIST_BYPASS_KEY, $bypass_json, 0, 0);
    $mem->close();
    return $list;
}

?>
