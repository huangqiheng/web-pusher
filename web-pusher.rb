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

OMP_DOMAIN_NAME = 'omp.cn'
LOG_FILE = 'log/web-pusher.log'
CONFIG_FILE = 'web-pusher.yml'
DB_FILE = 'devices.db'
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

db = Daybreak::DB.new DB_FILE

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

get '/device/:command' do
	command = params[:command]
	if (command == 'get')
		device_id = request.cookies['device_id']
		if (device_id == nil)
			device_id = UUID.generate().delete('-')
			response.set_cookie('device_id', :value => device_id,
					:domain => OMP_DOMAIN_NAME,
					:path => '/',
					:expires => Time.utc(2100,'jan',1,0,0,0))
		end
		db[device_id] = Time.now.to_i
		return device_id
	elsif (command == 'list')
		list = Array.new
		db.each do |key, value|
			list << key
		end
		return MultiJson.dump(list, :pretty=>true)
	end
end

get '/send/device/:id/:msg' do
	device_id = params[:id]

	if (device_id.length != 32)
		index_tofind = device_id.to_i
		index = 0
		db.each do |key, value|
			if (index == index_tofind)
				device_id = key
				break
			end
			index += 1
		end
	end

	headers = {}
	headers['Host'] = OMP_DOMAIN_NAME
	headers['Content-Type'] = 'application/json; charset=utf-8'
	Mechanize.new.post("http://localhost:#{PROXY_PORT}/pub?id=#{device_id}", params[:msg], headers)
	'succeed'
end

get '/role/bind/:device/:domain/:account' do
	puts 'device id', params[:device]
	puts 'domain', params[:domain]
	puts 'account', params[:account]
	'ok'
end

get '/role/reset/:device' do

end

not_found do
	'deny' 
end

error do
	'error'
end
