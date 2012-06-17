;(function ($, window, undefined) {
	var GameDetail, DetailViewer;

	DetailViewer = function () {
		return this;
	};

	DetailViewer.prototype = {
		buildHTML: function () {
			var element = document.createElement('section'), 
			    self = this;

			element.classList.add('detail-viewer');
			
			this.view = element;
			return this.view;
		},

		show: function () {
			this.view.classList.add('visible');
		},

		hide: function () {
			var self = this;
			this.view.classList.remove('visible');
			this.view.addEventListener('webkitTransitionEnd', this.onTransitionEnd = function (e) {
				self.empty();
				console.log('onTransitionEnd');
				self.view.removeEventListener('webkitTransitionEnd', self.onTransitionEnd);
				e.stopPropagation();
			});
		},

		push: function (elm) {
			this.view.appendChild(elm);
		}, 

		empty: function () {
			this.view.innerHTML = '';
		},
	};
	

	GameDetail = function (data) {

		return this;
	};

	GameDetail.prototype = {
		buildHTML: function () {
			return '<div class="html"></div>';
		},

		subscribe: function (message, callback) {
			var self = this;
			this.subscription = pubsub.subscribe('detail updated', self.updateDetails);
		},

		updateDetails: function (data) {

		},

		close: function () {
			pubsub.unsubscribe(this.subscription);
		},


	};

	PreviewGameDetail = function (data) {
		self = $.extend(GameDetail.prototype, PreviewGameDetail.prototype);
		console.log(self);
		self.data = data;
		return self;
	};

	PreviewGameDetail.prototype = {
		buildHTML: function () {
			return 'string';
		},

	};

	BoxScoreDetail = function (data) {
		self = $.extend(GameDetail.prototype, BoxScoreDetail.prototype);
		console.log(self);
		self.data = data;
		return self;
	};

	BoxScoreDetail.prototype = {
		buildHTML: function (data) {
			console.log('new BoxScoreDetail: ', data);
			// return 'boxscore';
			return document.createElement('div');
		},
	};

	window.DetailViewer = DetailViewer;
	window.PreviewGameDetail = PreviewGameDetail;
	window.BoxScoreDetail = BoxScoreDetail;

})(jQuery, this);