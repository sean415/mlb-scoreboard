#!/usr/bin/ruby
require 'sinatra'
require 'net/http'
require 'uri'

set :public_folder, '.'

get '/' do
  File.read('index.html')
end

# get '/proxy/:url' do

#   def open(url)
#     Net::HTTP.get(URI.parse(url))
#   end

#   page_content = open(params[:url])
#   puts page_content

# end

get '/scoreboard/:year/:month/:day' do
  host = 'gd2.mlb.com'
  base_path = 'components/game/mlb'
  filename = 'miniscoreboard.json'

  Net::HTTP.get(URI.parse("http://#{host}/#{base_path}/year_#{params[:year]}/month_#{params[:month]}/day_#{params[:day]}/#{filename}"))

end

get '/boxscore/:year/:month/:day/:gid' do
  host = 'gd2.mlb.com'
  base_path = 'components/game/mlb'
  filename = 'boxscore.json'

  Net::HTTP.get(URI.parse("http://#{host}/#{base_path}/year_#{params[:year]}/month_#{params[:month]}/day_#{params[:day]}/gid_#{params[:gid]}/#{filename}"))
end

get '/preview/:year/:month/:day/:gid' do
  host = 'gd2.mlb.com'
  base_path = 'components/game/mlb'
  filename = 'atv_preview_noscores.xml'

  Net::HTTP.get(URI.parse("http://#{host}/#{base_path}/year_#{params[:year]}/month_#{params[:month]}/day_#{params[:day]}/gid_#{params[:gid]}/#{filename}"))
end