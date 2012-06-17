var pubsub = {};

(function (p) {
	var topics = {},
	    subUid = -1;

	p.publish = function (topic, args) {
		var subscribers, len;

		if (!topics[topic]) {
			return false;
		}

		subscribers = topics[topic];
	
		len = subscribers ? subscribers.length : 0;

		while (len--) {
			subscribers[len].func(topic, args);
		}
	};

	p.subscribe = function (topic, func) {
		var token;

		if (!topics[topic]) {
			topics[topic] = [];
		}

		token = (++subUid).toString();
		
		topics[topic].push({
			token: token,
			func: func
		});
		return token;
	};

	p.unsubscribe = function (token) {
		for (var m in topics) {
			if (topics[m]) {
				for (var i = 0, j = topics[m].length; i < j; i++) {
					if (topics[m][i].token === token) {
						topics[m].splice(i, 1);
						return token;
					}
				}
			}
		}
		return this;
	};

})(pubsub);