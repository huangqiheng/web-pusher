#encoding: utf-8
class PusherApp < Sinatra::Base
  register Sinatra::RocketIO
  io = Sinatra::RocketIO

  #*******************************
  #     实时推送连接
  #*******************************

  io.on :chat do |data, client|
    puts "#{data['name']} : #{data['message']}  - #{client}"
    push :chat, data, :channel => client.channel
  end

  #*******************************
  #	常规sinatra访问
  #*******************************

  get '/hbeat/:type' do
	'ok'
  end

  get '/bind/:website/with/:user' do
	'ok'
  end

  get '/chat/:channel' do
    @channel = params[:channel]
    haml :chat
  end

  get '/:source.css' do
    scss params[:source].to_sym
  end

  #*******************************
  #     常规连接事件记录
  #*******************************

  io.once :start do
    puts "RocketIO start!!!"
  end

  io.on :connect do |client|
    puts "new client  - #{client}"
    push :chat, {:name => "system", :message => "new #{client.type} client <#{client.session}>"}, :channel => client.channel
    push :chat, {:name => "system", :message => "welcome <#{client.session}>"}, :to => client.session
  end

  io.on :disconnect do |client|
    puts "disconnect client  - #{client}"
    push :chat, {:name => "system", :message => "bye <#{client.session}>"}, :channel => client.channel
  end

  io.on :error do |err|
    STDERR.puts "error!! #{err}"
  end

end
