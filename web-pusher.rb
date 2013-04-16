#encoding: utf-8
require 'rubygems'
require 'yaml'
#require 'logger'
require 'digest/md5'
require 'uri'
require 'multi_json'
require 'sinatra'
require 'uuid'
require 'daybreak'

=begin 
=================================================================
	读取配置文件
=================================================================
=end

$config = YAML.load_file 'web-pusher.yml'
server_conf = $config['server']
host = server_conf['host']
port = server_conf['port']

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
set :public_folder, Proc.new { File.join(root, "public") }
set :views, Proc.new { File.join(root, "views") }
set :environment, :production

db = Daybreak::DB.new 'devices.db'

get '/device/:command' do
	command = params[:command]
	response['Access-Control-Allow-Origin'] = '*'
	
	if (command == 'get')
		device_id = request.cookies['device_id']
		if (device_id == nil)
			device_id = UUID.generate().delete('-')
			response.set_cookie('device_id', :value => device_id,
					:domain => 'omp.cn',
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

get '/role/bind/:device/:key/:value' do

end

get '/role/reset/:device' do

end

not_found do
	'deny' 
end

error do
	'error'
end
