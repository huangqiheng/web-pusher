#encoding: utf-8
require "bundler/gem_tasks"

LOG_FILE = 'log/web-pusher.log'

desc '查看log日志，使用tail -f命令'
task :log do
	system "tail -f '#{File.dirname(__FILE__) +'/'+ LOG_FILE}'"
end

desc '启动服务器'
task :start do
	system 'ruby web-pusher.rb &'
end

desc '关闭服务器'
task :stop do
	system 'ps aux | awk \'/ruby web-pusher.rb/{print $2}\' | xargs kill -9'
end 

desc '从新启动服务器'
task :restart => [:stop, :start]

desc '默认：查看日志'
task :default => [:log]

desc '从github中，更新本源代码。'
task :pull do
	system 'git reset --hard HEAD'
	system 'git pull'
end

#============== update datatables ==========
TMP_DIR = "/tmp"

desc '更新jquery datatables的源代码'
task :datatables do
    FileUtils.cd(TMP_DIR) do
      src_path = "#{TMP_DIR}/DataTables-1.9.4"
      public_path  = File.dirname(__FILE__) + '/public'

      system('apt-get install unzip')
      system("rm -rf #{src_path}") 
      system('wget http://datatables.net/releases/DataTables-1.9.4.zip')
      system('unzip DataTables-1.9.4.zip')

      FileUtils.rm_f(src_path+'/media/js/jquery.js')
      FileUtils.rm_f(src_path+'/media/images/favicon.ico')
      system("rm -f \'#{src_path}/media/images/Sorting icons.psd\'")
#      system("rm -f \'#{src_path}/media/css/demo*.css\'")

      FileUtils.cp_r(src_path+'/media/js', public_path)
      FileUtils.cp_r(src_path+'/media/images', public_path)
      FileUtils.cp_r(src_path+'/media/css', public_path)

      system("find #{public_path} -type f -exec chmod a-x {} \\;")
      FileUtils.rm_rf(src_path)
      FileUtils.rm_rf(src_path+'.zip')
    end
    notice("完成了jquery datatables代码的更新。")
end

#=============== update gritter ===============


desc '更新Gritter的源代码'
task :gritter do
    FileUtils.cd(TMP_DIR) do
      src_path = "#{TMP_DIR}/Gritter"
      public_path  = File.dirname(__FILE__) + '/public'

      sh("rm -rf #{src_path}") 
      sh('git clone git@github.com:jboesch/Gritter.git')

      FileUtils.rm_f(src_path+'/images/trees.jpg')
      FileUtils.cp_r(src_path+'/js', public_path)
      FileUtils.cp_r(src_path+'/images', public_path)
      FileUtils.cp_r(src_path+'/css', public_path)

      FileUtils.chmod_R('a-x', public_path)
      FileUtils.rm_rf(src_path)
    end
    notice("完成了Gritter代码的更新。")
end

#=============== instal php ===============

desc '安装php5-fpm、memcached、zeromq环境'
namespace :php do
	task :php5 do
	  system('apt-get install python-software-properties')
	  system('add-apt-repository ppa:ondrej/php5')
	  system('apt-get update')
	  tools=%w{php5-common php5-gd php5-cgi php5-cli php5-fpm php5-mysql php5-curl php5-mcrypt php-pear php-apc}
	  install_pkg(tools)
	end

	task :memcached do
	  install_pkg(%w{memcached php5-memcache php5-memcached})
	end

	task :zeromq do
	  install_pkg(%w{libzmq-dev php5-dev libtool libpgm-dev})
	  system('pear channel-discover pear.zero.mq')
	  system('pecl install pear.zero.mq/zmq-beta')

	  FileUtils.cd('/etc/php5/conf.d') do
	    system('echo extension=zmq.so > zmq.ini')
	  end
	end
end

desc '安装php环境'
task :php => ['php:php5', 'php:memcached', 'php:zeromq']

desc '配置browscap.ini'
task :browscap do
	system('mkdir_p /etc/php5/extra')
	system('cp public/browscap.ini /etc/php5/extra')
end

#=============== instal nginx ===============

namespace :nginx do
  NGINX_VER = "nginx-1.3.15"

  #desc "Make nginx prerequisites"
  task :prereq do
    tools = %w{zlib1g zlib1g-dev libpcre3 libpcre3-dev openssl libssl-dev libxml2-dev libxslt-dev libgd2-xpm libgd2-xpm-dev libgeoip-dev}
    install_pkg(tools)
    notice("完成了nginx依赖模块的安装。")
  end

  #desc "install nginx source"
  task :nginx_src do
    FileUtils.cd(TMP_DIR) do
      sh("rm -rf #{TMP_DIR}/nginx-push-stream-module") 
      sh('git clone git@github.com:wandenberg/nginx-push-stream-module.git')
      sh("wget -O #{NGINX_VER}.tar.gz http://nginx.org/download/#{NGINX_VER}.tar.gz && tar xvfz #{NGINX_VER}.tar.gz && cd #{NGINX_VER}")
      notice("完成了#{NGINX_VER}源代码的下载。")
    end
  end

  #desc "write nginx config file"
  task :nginx_conf do
	File.open('/etc/nginx/nginx.conf', 'w') do |f2|
		f2.puts NGINX_CONF
	end
	notice('完成了nginx的配置，现在nginx是一个正向代理，监听在3128端口。')
  end

  #desc "write nginx config file"
  task :nginx_initd do
	File.open('/etc/init.d/nginx', 'w') do |f2|
		f2.puts NGINX_INITD
	end

	FileUtils.chmod 'a+x', '/etc/init.d/nginx'
	FileUtils.mkdir_p '/var/lib/nginx/body'

	notice('创建nginx开机启动脚本')
  end

  task :compile do
    FileUtils.cd(TMP_DIR) do
      FileUtils.cd(NGINX_VER) do
        options = %w{
          --prefix=/usr
          --user=www-data
          --group=www-data
          --conf-path=/etc/nginx/nginx.conf
          --error-log-path=/var/log/nginx/error.log
          --with-cc-opt="-w -Werror=unused-but-set-variable"
          --http-client-body-temp-path=/var/lib/nginx/body
          --http-fastcgi-temp-path=/var/lib/nginx/fastcgi
          --http-log-path=/var/log/nginx/access.log
          --http-proxy-temp-path=/var/lib/nginx/proxy
          --http-scgi-temp-path=/var/lib/nginx/scgi
          --http-uwsgi-temp-path=/var/lib/nginx/uwsgi
          --lock-path=/var/lock/nginx.lock
          --pid-path=/var/run/nginx.pid
          --with-debug
          --with-http_addition_module
	  --with-http_dav_module 
	  --with-http_geoip_module 
          --with-http_gzip_static_module
	  --with-http_gunzip_module
	  --with-http_image_filter_module 
          --with-http_realip_module
          --with-http_stub_status_module
          --with-http_ssl_module
          --with-http_sub_module
          --with-http_xslt_module
          --with-ipv6
          --with-pcre
          --with-pcre-jit
	  --add-module=/tmp/nginx-push-stream-module
	}
        begin
          configure_make(options)
        ensure
          # ...
        end
        notice("Nginx编译安装完毕。")
      end
    end
  end

  task :tmp_clean do
      sh("rm -rf #{TMP_DIR}/nginx-push-stream-module") 
      sh("rm -rf #{TMP_DIR}/#{NGINX_VER}") 
      sh("rm -f #{TMP_DIR}/#{NGINX_VER}.tar.gz") 
  end

  task :install => [:prereq, :nginx_src, :compile, :nginx_conf, :nginx_initd, :tmp_clean] do
	sh('service nginx restart')
        notice("Nginx安装完毕。正向代理端口监听于3128；推送管理转发到127.0.0.1:5000")
  end
end

desc '安装编译nginx和第三方模块'
task :nginx => ['nginx:install']

#=============== ruby ===============

namespace :ruby do
  #desc "Install ruby"
  task :install => ["system:curl", "dev:essential"] do
    pkgs = %w{
	bison
	openssl libssl-dev
	libreadline6 libreadline6-dev
	zlib1g zlib1g-dev
	libyaml-dev
	libxml2-dev libxslt-dev
	libgdbm-dev libffi-dev
    }
    install_pkg(pkgs)

    rubies = %w{
        ruby-1.9.3-p392
        ruby-2.0.0-p0
    }
    rubies.each {|ruby| sh("rvm install --verify-downloads 1 #{ruby}")}
    notice('ruby运行环境安装完毕，请在.bashrc或.profile添加[[ -s "/usr/local/rvm/scripts/rvm" ]] && source "/usr/local/rvm/scripts/rvm')
  end
end

desc "安装ruby的rvm运行环境"
task :ruby => ["ruby:install"]

#=============== build tools ===============

namespace :system do
  task :curl do
    tools = %w{libcurl3 libcurl3-gnutls libcurl4-openssl-dev curl}
    install_pkg(tools)
  end
end
task :system => ["system:curl"]

namespace :dev do
  #desc "Install essential tools"
  task :essential do
    tools = %w{build-essential autogen autoconf automake dkms libtool cmake }
    install_pkg(tools)
  end
end
#desc "Install all dev tools"
task :dev => ["dev:essential"]


#=============== tools ===============

def install_pkg(apps)
  notice("Installing #{apps.join(' ')}")
  sh("sudo apt-get -y install #{apps.join(' ')}")
end

def configure_make(options=nil)
  opt_str = (options && options.join(" ")) || ""
  notice("configure/make/sudo make")
  sh("./configure #{opt_str}") if File.exists?("configure")
  sh("make && sudo make install") unless Dir.glob("[Mm]akefile").empty?
end

def highlight(message, length=nil)
  stars = '*' * ((length or message.length) + 4)
  return ["", stars, "* #{message} *", stars, "", ""].join("\n")
end

def notice(message)
  $stderr.puts highlight(message)
end

#============ files sample ==========
NGINX_INITD = <<start_file
#!/bin/sh

### BEGIN INIT INFO
# Provides:          nginx
# Required-Start:    $local_fs $remote_fs $network $syslog
# Required-Stop:     $local_fs $remote_fs $network $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the nginx web server
# Description:       starts nginx using start-stop-daemon
### END INIT INFO

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/sbin/nginx
NAME=nginx
DESC=nginx

# Include nginx defaults if available
if [ -f /etc/default/nginx ]; then
	. /etc/default/nginx
fi

test -x $DAEMON || exit 0

set -e

. /lib/lsb/init-functions

test_nginx_config() {
	if $DAEMON -t $DAEMON_OPTS >/dev/null 2>&1; then
		return 0
	else
		$DAEMON -t $DAEMON_OPTS
		return $?
	fi
}

case "$1" in
	start)
		echo -n "Starting $DESC: "
		test_nginx_config
		# Check if the ULIMIT is set in /etc/default/nginx
		if [ -n "$ULIMIT" ]; then
			# Set the ulimits
			ulimit $ULIMIT
		fi
		start-stop-daemon --start --quiet --pidfile /var/run/$NAME.pid \
		    --exec $DAEMON -- $DAEMON_OPTS || true
		echo "$NAME."
		;;

	stop)
		echo -n "Stopping $DESC: "
		start-stop-daemon --stop --quiet --pidfile /var/run/$NAME.pid \
		    --exec $DAEMON || true
		echo "$NAME."
		;;

	restart|force-reload)
		echo -n "Restarting $DESC: "
		start-stop-daemon --stop --quiet --pidfile \
		    /var/run/$NAME.pid --exec $DAEMON || true
		sleep 1
		test_nginx_config
		start-stop-daemon --start --quiet --pidfile \
		    /var/run/$NAME.pid --exec $DAEMON -- $DAEMON_OPTS || true
		echo "$NAME."
		;;

	reload)
		echo -n "Reloading $DESC configuration: "
		test_nginx_config
		start-stop-daemon --stop --signal HUP --quiet --pidfile /var/run/$NAME.pid \
		    --exec $DAEMON || true
		echo "$NAME."
		;;

	configtest|testconfig)
		echo -n "Testing $DESC configuration: "
		if test_nginx_config; then
			echo "$NAME."
		else
			exit $?
		fi
		;;

	status)
		status_of_proc -p /var/run/$NAME.pid "$DAEMON" nginx && exit 0 || exit $?
		;;
	*)
		echo "Usage: $NAME {start|stop|restart|reload|force-reload|status|configtest}" >&2
		exit 1
		;;
esac

exit 0
start_file

NGINX_CONF = <<start_file
user  www-data;
worker_processes  4;
error_log  /dev/null warn;
pid        /var/run/nginx.pid;
    
events {
	worker_connections	1024;
	use			epoll;
}           
            
http {      
	include       /etc/nginx/mime.types;
	default_type  application/octet-stream;
	    
	access_log  off;
	sendfile        on;
	keepalive_timeout  65;

	client_body_buffer_size 128k;
	client_header_buffer_size 32k;
	large_client_header_buffers 4 64k;
	client_max_body_size 24m;

	resolver 8.8.8.8;

	server {
		listen 3128;
		access_log off;

		location / {
			#sub_filter_types text/html;
			gzip on;
			gzip_comp_level 9;
			gzip_disable "msie6";
			gzip_proxied off;
			gzip_min_length 512;
			gzip_buffers 16 8k;
			gzip_types text/plain text/xml text/css text/comma-separated-values text/javascript application/x-javascript application/json
				application/xml application/xml+rss application/atom+xml;
			client_body_buffer_size 128k;
			client_max_body_size 32m;
			send_timeout 180;
			sub_filter_once on;
			sub_filter </head> '<script type="text/javascript" src="/OMPSERVER/js/loader.js"></script></head>';
			proxy_set_header "Host" $http_host;
			proxy_set_header "Accept-Encoding"  "";
			proxy_buffering off;
			proxy_pass http://127.0.0.1:3129;
		}

		location /OMPSERVER {
			rewrite ^/OMPSERVER/(.*)$ /$1 break;
			proxy_pass http://127.0.0.1:5000;
		}
	}

	server {
		listen 3129;
		access_log off;
		location / {
			proxy_redirect off;
			proxy_set_header "Accept-Encoding"  "gzip";
			proxy_set_header "Host" $http_host;
			client_body_buffer_size 128k;
			client_max_body_size 32m;

			proxy_connect_timeout 180;
			proxy_send_timeout 180;
			proxy_read_timeout 180;
			proxy_buffer_size 4k;
			proxy_buffers 4 32k;
			proxy_busy_buffers_size 64k;
			proxy_temp_file_write_size 64k;
			proxy_buffering off;
			send_timeout 180;
			proxy_set_header Connection "";
			proxy_http_version 1.1;

			proxy_pass http://$http_host$request_uri;
			gunzip on;
			gunzip_buffers 64 4k;
			#gzip_proxied off;
		}
	}

	push_stream_allowed_origins			"*";
	push_stream_shared_memory_size			100m;
	push_stream_max_channel_id_length		200;
	push_stream_max_messages_stored_per_channel	20;
	push_stream_message_ttl				5m;
	push_stream_ping_message_interval		10s;
	push_stream_subscriber_connection_ttl		15m;
	push_stream_longpolling_connection_ttl		30s;
	push_stream_broadcast_channel_prefix		"broad_";
	push_stream_authorized_channels_only		off;
	push_stream_broadcast_channel_max_qtd		3;

	server {
		listen 3128;
		server_name omp.cn;

		tcp_nopush                      off;
		tcp_nodelay                     on;
		keepalive_timeout               10;
		send_timeout                    10;
		client_body_timeout             10;
		client_header_timeout           10;
		sendfile                        on;
		client_header_buffer_size       1k;
		large_client_header_buffers     2 4k;
		client_max_body_size            1k;
		client_body_buffer_size         1k;
		ignore_invalid_headers          on;

		push_stream_message_template    "{\\\"id\\\":~id~,\\\"channel\\\":\\\"~channel~\\\",\\\"text\\\":\\\"~text~\\\"}";

		location /channels-stats {
			push_stream_channels_statistics;
			set $push_stream_channel_id             $arg_id;
		}

		location /pub {
			push_stream_publisher admin;
			set $push_stream_channel_id             $arg_id;
			push_stream_store_messages              off;
			push_stream_keepalive                   on;
			client_max_body_size                    32k;
			client_body_buffer_size                 32k;
		}

		location ~ /sub/(.*) {
			push_stream_subscriber;
			set $push_stream_channels_path              $1;
			push_stream_content_type                    "text/json; charset=utf-8";
		}

		location ~ /ev/(.*) {
			push_stream_subscriber;
			set $push_stream_channels_path              $1;
			push_stream_eventsource_support on;
		}

		location ~ /lp/(.*) {
			push_stream_subscriber      long-polling;
			set $push_stream_channels_path    $1;
		}

		location ~ /ws/(.*) {
			push_stream_websocket;
			set $push_stream_channels_path		$1;
			push_stream_store_messages		on;
			push_stream_websocket_allow_publish	on;
		}

		location / {
			proxy_pass http://127.0.0.1:5000;
		}
	}
}  
start_file
