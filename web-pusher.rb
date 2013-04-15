#encoding: utf-8
require 'yaml'
#require 'logger'
require 'digest/md5'
require 'uri'
require 'multi_json'
require 'sinatra'
require 'uuid'

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
set :sessions, true
set :public_folder, Proc.new { File.join(root, "public") }
set :views, Proc.new { File.join(root, "views") }
set :environment, :production

get '/device' do
	if (session[:device_id] == nil)
		session[:device_id] = UUID.generate
	end
	return session[:device_id].inspect
end

not_found do
	'deny' 
end

error do
	'error'
end
