
;(function ($, window, undefined) {

// controller
var Scoreboard, NavigationBar, Poller;

Poller = function (url, callback, refreshRate) {
	
	var refreshRate = refreshRate || 10000;
	
	this.url = url;
	this.callback = callback;

	this.getData = function () {
		callback = this.callback;
		$.getJSON(this.url, callback);
	};

	this.poll = function () {
		var self = this;

		this.pollerInstance = setInterval(function () {
			self.getData();
		}, refreshRate);

		return this.poller;
	};

	this.stopPolling = function (pollerID) {
		var self = this;
		clearInterval(self.pollerInstance);
	};

};

NavigationBar = function (element) {
	this.view = element;
	this.leftButtonCallback = function () {};
	this.rightButtonCallback = function () {};

	this.bind();
};

NavigationBar.prototype = {
	bind: function () {
		var self = this;
		this.view.querySelector('a:first-child').addEventListener('click', function () {
			self.leftButtonCallback();
		});

		this.view.querySelector('a:last-child').addEventListener('click', function () {
			 self.rightButtonCallback();
		});
	},

	setTitle: function (str) {
		if (typeof str !== 'string') return;
		this.view.querySelector('h1').innerHTML = str;
	},

	setLeftButton: function (callback) {
		this.leftButtonCallback = callback;
	},

	setRightButton: function (callback) {
		this.rightButtonCallback = callback;
	}

};

ScoreBoard = function (wrapper) {
	
	this.wrapper = wrapper;
	this.header = wrapper.querySelector('header');
	this.navigationBar = new NavigationBar(this.wrapper.querySelector('header'));
	
	this.currentDateInView = new Date();
	this.currentView = new ScoreBoardForDay(this.currentDateInView);
	this.showGamesForDate(this.currentView);

	this.bind();
	this.buildDetailViewer();
	
	return this;
};

ScoreBoard.prototype = {

	buildDetailViewer: function () {
		var self = this;
		this.detailViewer = new DetailViewer();
		this.wrapper.appendChild(this.detailViewer.buildHTML());

		pubsub.subscribe('new detail', function () {
			self.detailViewer.push(document.createElement('hr'));
			self.detailViewer.show();
			self.navigationBar.setTitle('test');
			self.navigationBar.setLeftButton(function () {
				self.hideDetailViewer();
			});
		});

	},

	showDetailViewer: function () {},

	hideDetailViewer: function () {
		var self = this;

		this.navigationBar.setTitle('closed');
		this.detailViewer.hide();
		this.navigationBar.setLeftButton(function () {
			var date = self.currentDateInView;
			self.changeDate(new Date(date).getTime() - 86400000);
		});
	},

	bind: function () {
		var self = this;

		this.navigationBar.setRightButton(function () {
			var date = self.currentDateInView;
			self.changeDate(new Date(date).getTime() + 86400000);
		});

		this.navigationBar.setLeftButton(function () {
			var date = self.currentDateInView;
			self.changeDate(new Date(date).getTime() - 86400000);
		});
	},


	showGamesForDate: function (currentView, callback) {
		this.wrapper.appendChild(currentView.buildHTML());
	},	

	changeDate: function (date) {
		var currScoreboard = this.wrapper.querySelector('.games');
		
		this.currentView.clearGames();

		this.currentView = new ScoreBoardForDay(date);
		this.currentDateInView = date;
		
		if (currScoreboard) {
			this.wrapper.replaceChild(this.currentView.buildHTML(), currScoreboard);
		} else {
			this.wrapper.appendChild(this.currentView.buildHTML());
		}
	}, 

	set currentDateInView (date) {
		var months = ["January", "Feburary", "March", "April", "May", "June", "July", "September", "October", "November", "December"];
		date = new Date(date);

		this._currentDateInView = date;
		this.navigationBar.setTitle(months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear());
		return this._currentDateInView;
	},

	get currentDateInView () {
		return this._currentDateInView;
	}

};

window.Poller = Poller;

window.addEventListener('load', function () {
	window.scoreboard = {};
	window.scoreboard.currentView = new ScoreBoard(document.querySelector('.scoreboard'));
});

})(jQuery, this);