#!/usr/bin/env ruby

# Sinatra-based webserver that serves up the Javascript game.

require 'sinatra/base'

class TetrisServer < Sinatra::Base

  configure do
    set :bind, '0.0.0.0'
    set :public_folder, 'public'
    set :views, 'views'
    set :port, (ENV['USER'] == 'root' ? 80 : 6780)
  end

  get '/' do
    erb :tframe
  end

  get '/index.html' do
    '<html><title>It worked!</title><body><h>It worked!</h></body></html>'
  end

end

TetrisServer.run! if $0 == __FILE__
