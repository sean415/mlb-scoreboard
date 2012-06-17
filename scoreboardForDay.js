;(function ($, window, undefined) {
/* scoreboardForDay */
var ScoreBoardForDay;

ScoreBoardForDay = function (date) {
	date = new Date(date);
	
	this.dataURL = this.constructDataURL(date);
	this.games = {};
	this.gamesObj = {};

	this.init();
	this.view = this.buildHTML();

	return this;

};

ScoreBoardForDay.prototype = {

	getView: function () {
		return this.view;
	},

	buildHTML: function () {
		return this.instanceWrapper;
	},

	constructDataURL: function (date) {

		var proxyURL = '/static/fpo/html/proxy.php?url=',
	        gameDayBaseURL = 'http://gd2.mlb.com/components/game/mlb/',
	        fileName = 'miniscoreboard.json',
	        year = date.getFullYear().toString(),
	        month = date.getMonth() + 1,
	        day = date.getDate();

		return proxyURL + gameDayBaseURL + 'year_' + year + '/' + 'month_' + (month < 10 ? '0' + month : month) + '/' + 'day_' + (day < 10 ? '0' + day : day) + '/' + fileName;
	},
	
	init: function () {
		var instanceWrapper;

		instanceWrapper = document.createElement('section');
		instanceWrapper.classList.add('games');

		this.instanceWrapper = instanceWrapper;
		this.getData(this.dataURL);
		
		this.startPoller();
	
	},

	loadGames: function (data) {

		var games = data.data.games.game,
		    game, i, len;

		if (games.length > 1) {
			for (i = 0, len = games.length; i < len; i++) {
				game = new Game(games[i]);
				this.gamesObj[games[i].id] = game;

				this.instanceWrapper.appendChild(game.getView());
			}
		}

	},

	getData: function (url) {
		var self = this;
		$.getJSON(url, function (data) { self.loadGames.call(self, data); });
	},

	updateGames: function (data) {
		var games = data.data.games.game, 
		    i, len, id, game;

		for (i = 0, len = games.length; i < len; i++) {
			game = games[i];
			id = game.id;
			pubsub.publish(id + '_updated', game);
		}

	},

	startPoller: function () {
		var self = this;
		this.poller = new Poller(this.dataURL, self.updateGames);
		this.poller.poll();
	},

	clearGames: function () {
		var game;
		for (game in this.gamesObj) {
			this.gamesObj[game].cancelSubscription();
		}

		this.quitPoller();
	},

	quitPoller: function () {
		this.poller.stopPolling();
	},

};

window.ScoreboardForDay = ScoreBoardForDay;

})(jQuery, this);