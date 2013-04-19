#encoding: utf-8
require 'rubygems'
require 'yaml'
require 'digest/md5'
require 'uri'
require 'multi_json'
require 'sinatra'
require 'uuid'
require 'daybreak'
require 'mechanize'
require 'logger'

APP_ROOT = File.dirname(__FILE__)
OMP_DOMAIN_NAME = 'omp.cn'
LOG_FILE = "#{APP_ROOT}/log/web-pusher.log"
CONFIG_FILE = "#{APP_ROOT}/web-pusher.yml"
DB_FILE = "#{APP_ROOT}/devices.db"
PROXY_PORT = 3128

=begin 
=================================================================
	读取配置文件
=================================================================
=end
$config = YAML.load_file CONFIG_FILE
server_conf = $config['server']
host = server_conf['host']
port = server_conf['port']

=begin 
=================================================================
	日志
=================================================================
=end
log_file = File.new(LOG_FILE, 'a+')
logger = Logger.new(log_file, 'weekly')
logger.level = Logger::DEBUG
$stdout.reopen log_file
$stderr.reopen $stdout
$stdout.sync = true
$stderr.sync = true

=begin 
=================================================================
	sinatra
=================================================================
=end

#配置服务器
set :bind, host
set :port, port
set :root, File.dirname(__FILE__)
set :app_file, __FILE__
set :sessions, false 
set :logging, true 
set :raise_errors, true
set :public_folder, Proc.new { File.join(root, "public") }
set :views, Proc.new { File.join(root, "views") }
set :environment, :production

$db = Daybreak::DB.new DB_FILE

before do
	if (request.referer) 
		uri = URI(request.referer)
		origin = "#{uri.scheme}://#{uri.host}"
	else	
		origin = '*'
	end
	response['Access-Control-Allow-Origin'] = origin
	response['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
	response['Access-Control-Allow-Credentials'] = 'true'
end

def send_message_raw(device_id, message)
	headers = {}
	headers['Host'] = OMP_DOMAIN_NAME
	headers['Content-Type'] = 'application/json; charset=utf-8'
	Mechanize.new.post("http://localhost:#{PROXY_PORT}/pub?id=#{device_id}", message, headers)
end

def send_message(device_id, message)
	if (device_id.length != 32)
		index_tofind = device_id.to_i
		index = 0
		$db.each do |key, value|
			if (index == index_tofind)
				device_id = key
				break
			end
			index += 1
		end
	end

	send_message_raw(device_id, message)
end

def device_cmd(request, command)
	if (command == 'get')
		device_id = request.cookies['device_id']
		if (device_id == nil)
			device_id = UUID.generate().delete('-')
			response.set_cookie('device_id', 
				:value => device_id,
				:domain => OMP_DOMAIN_NAME,
				:path => '/',
				:expires => Time.utc(2100,'jan',1,0,0,0))
		end
		$db[device_id] = Time.now.to_i
		return device_id
	elsif (command == 'list')
		list = Array.new
		$db.each do |key, value|
			list << key
		end
		return MultiJson.dump(list, :pretty=>true)
	end
end

get '/omp.php' do
	case params[:type]
	when 'device'
		redirect "http://omp.cn/device/#{params[:cmd]}"
	when 'send'
		redirect "http://omp.cn/send/device/#{params[:id]}/#{params[:msg]}"
	when 'bind'
		redirect "http://omp.cn/role/bind/#{params[:device]}/#{params[:plat]}/#{params[:user]}/#{params[:nick]}"
	when 'reset'
		redirect "http://omp.cn/role/reset/#{params[:device]}"
	end
end

get '/device/:cmd' do
	command = params[:cmd]
	device_cmd(request, command)
end

get '/send/device/:id/:msg' do
	device_id = params[:id]
	message = params[:msg]
	send_message device_id, message
	'succeed'
end

get '/role/bind/:device/:plat/:user/:nick' do
	puts "device id: #{params[:device]}"
	puts "platform: #{params[:plat]}"
	puts "user: #{params[:user]}"
	puts "nick: #{params[:nick]}"
	'ok'
end

get '/role/reset/:device' do
	params[:device]
end

not_found do
	'deny' 
end

error do
	'error'
end
