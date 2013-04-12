#encoding: utf-8
require "bundler/gem_tasks"

desc '启动服务器'
task :start do
	system 'export PORT=5000'
	system 'export WS_PORT=8080'
	system 'rackup config.ru -p 5000'
end

desc '从github中，更新本源代码。'
task :pull do
	system 'git reset --hard HEAD'
	system 'git pull'
end

#=============== instal nginx ===============

namespace :nginx do
  NGINX_VER = "nginx-1.3.15"
  TMP_DIR = "/tmp"

  #desc "Make nginx prerequisites"
  task :prereq do
    tools = %w{zlib1g zlib1g-dev libpcre3 libpcre3-dev openssl libssl-dev libxml2-dev libxslt-dev libgd2-xpm libgd2-xpm-dev libgeoip-dev}
    install_pkg(tools)
    notice("完成了nginx依赖模块的安装。")
  end

  #desc "install nginx source"
  task :nginx_src do
    FileUtils.cd(TMP_DIR) do
      sh("wget -O #{NGINX_VER}.tar.gz http://nginx.org/download/#{NGINX_VER}.tar.gz && tar xvfz #{NGINX_VER}.tar.gz && cd #{NGINX_VER}")
      notice("完成了#{NGINX_VER}源代码的下载。")
    end
  end

  #desc "write nginx config file"
  task :nginx_conf do
	File.open('/etc/nginx/nginx.conf', 'w') do |f2|
		f2.puts NGINX_CONF
	end

	File.open('/etc/init.d/nginx', 'w') do |f2|
		f2.puts NGINX_INITD
	end

	FileUtils.chmod 'a+x', '/etc/init.d/nginx'
	FileUtils.mkdir_p '/var/lib/nginx/body'

	notice('完成了nginx的配置，现在nginx是一个正向代理，监听在3124端口。')
  end

  task :nginx => [:prereq, :nginx_src, :nginx_conf] do
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
          --without-http_rewrite_module
        }
        begin
          configure_make(options)
        ensure
          # ...
        end
        notice("Nginx编译安装完毕。请输入service nginx start启动服务。")
      end
    end
  end
end

desc "安装编译nginx和第三方模块"
task :nginx => ["nginx:nginx"]

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
NGINX_CONF = <<start_file
user  www-data;
worker_processes  4;
error_log  /dev/null warn;
pid        /var/run/nginx.pid;
    
events {
	worker_connections  1024;
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
			sub_filter </head> '<script type="text/javascript" src="/OMPSTATIC/script.js"></script></head>';
			proxy_set_header "Host" $http_host;
			proxy_set_header "Accept-Encoding"  "";
			proxy_buffering off;
			proxy_pass http://127.0.0.1:3129;
		}

		location /OMPCLIENT {
			alias /srv/http/pusher/static;
		}

		location /OMPSERVER {
			proxy_set_header "Host" "omp.doctorcom.com";
			proxy_pass http://127.0.0.1:801/adjs/screen_js_lite.php;
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
}  
start_file

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
