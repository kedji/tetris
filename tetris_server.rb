#!/usr/bin/env ruby

# Sinatra-based webserver that serves up the Javascript game.

require 'sinatra/base'
require 'json'

class TetrisServer < Sinatra::Base
  MEETUP_WINDOW = 10.0    # seconds

  configure do
    set :bind, '0.0.0.0'
    set :public_folder, 'public'
    set :views, 'views'
    set :port, (ENV['USER'] == 'root' ? 80 : 6780)

    set :meetup, nil
    set :meetup_time, Time.at(0)
  end

  get '/' do
    erb :tframe
  end

  # Clients periodically POST here to register their multiplayer availability
  post '/advertise' do
$stderr.puts "++++++++ advertise"
    payload = JSON.parse(request.body.read)
    if payload['msg'] # and Time.now - settings.meetup_time > MEETUP_WINDOW
$stderr.puts "++++++++ setting advertisement"
      settings.meetup_time = Time.now
      settings.meetup = { 'msg' => payload['msg'], 'ip' => request.ip }
      '1'
    else
$stderr.puts "++++++++ cannot advertise ??"
      '0'
    end
  end

  get '/discover' do
    resp = {}
$stderr.puts "++++++++ discover"
    if settings.meetup and request.ip != settings.meetup['ip'] and
       Time.now - settings.meetup_time <= MEETUP_WINDOW
      resp = settings.meetup['msg']
      settings.meetup = nil
$stderr.puts "++++++++ discovery made!"
    end
    resp.to_json
  end

end

TetrisServer.run! if $0 == __FILE__
