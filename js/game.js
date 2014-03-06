;(function ($, window, undefined) {

  var Game;

  Game = function (data) {
    var self = this;

    this.data = data;
    this.id = data.id;
    this.homeTeam = data.home_name_abbrev;
    this.awayTeam = data.away_name_abbrev;

    this.view = this.buildHTML(data);

    this.updateSubscription = pubsub.subscribe(this.id + '_updated', function (topic, data) { self.update.call(self, topic, data); });

    this.update('', data);

    this.date = data.original_date;
    this.bind();

    return this;
  };

  Game.prototype = {
    getView: function () {
      return this.view;
    },

    showDetail: function () {
      var detail;

      switch (this._status) {
        case "Preview":
        case "Warmup":
        case "Pre-Game":
          detail = this.getPreview();
          break;
        case "Final":
        case "Game Over":
        case "In Progress":
          detail = this.getBoxscore();
          if (detail) {
            this.createGameDetail(detail);
          }
          break;
        case "default":
          detail = this.getPreview();
          break;
      }
    },

    buildGameURL: function () {
      var gamedayDate = this.date.split('/'),
          url = 'year_' + gamedayDate[0] + '/month_' + gamedayDate[1] + '/day_' + gamedayDate[2] + '/gid_' + this.id.replace(/\//g, '_').replace(/-/g, '_'),
          url = gamedayDate[0] + '/' + gamedayDate[1] + '/' + gamedayDate[2] + '/' + this.id.replace(/\//g, '_').replace(/-/g, '_');
      return url;
    },

    createGameDetail: function (data) {
      var detailHTML;
      this.detail = new BoxScoreDetail(data);
      detailHTML = this.detail.buildHTML(data);

      pubsub.publish('new detail', detailHTML);
    },

    getBoxscore: function () {
      var boxscroreURL = this.buildGameURL() + 'boxscore.json',
          response, self = this;

      $.getJSON('boxscore/' + this.buildGameURL(), function (repsonse) {
        self.createGameDetail(repsonse);
      });

    },

    getPreview: function () {
      var previewurl = this.buildGameURL() + 'atv_preview_noscores.xml';

      $.get('preview/' + this.buildGameURL(), function(response) {
        return response;
      });
    },

    create: function (data) {},

    bind: function () {
      var self = this;
      this.view.addEventListener('click', function () {
        self.showDetail();
      });
    },

    update: function (topic, data) {
      console.log(data);
      this.status = data.status;

      if (data.status === "Final") {
        this.homeScore = data.home_team_runs;
        this.awayScore = data.away_team_runs;
        this.homehits = data.home_team_hits;
        this.homeerrors = data.home_team_errors;
        this.awayScore = data.away_team_runs;
        this.awayhits = data.away_team_hits;
        this.awayerrors = data.away_team_errors;

        this.inning = ["F", ''];

        this.outs = 0;
        this.setRunners(data);

        this.cancelSubscription();

      } else if (data.status === "Game Over") {

        this.homeScore = data.home_team_runs;
        this.awayScore = data.away_team_runs;
        this.homehits = data.home_team_hits;
        this.homeerrors = data.home_team_errors;
        this.awayScore = data.away_team_runs;
        this.awayhits = data.away_team_hits;
        this.awayerrors = data.away_team_errors;

        this.inning = ["F", ''];

        this.outs = 0;
        this.setRunners(data);

      } else if (data.status === 'Warmup' || data.status === 'Pre-Game' || data.status === 'Preview') {

        this.inning = ['', ''];

      } else if (data.status === 'Postponed') {

        this.inning = ['P', ''];
        this.cancelSubscription();

      } else {

        this.inning = [data.inning, (data.top_inning === "Y" ? "top" : "bottom")];
        this.homeScore = data.home_team_runs;
        this.homehits = data.home_team_hits;
        this.homeerrors = data.home_team_errors;
        this.awayScore = data.away_team_runs;
        this.awayhits = data.away_team_hits;
        this.awayerrors = data.away_team_errors;
        this.outs = data.outs;

        this.setRunners(data);
      }
    },

    addBases: function () {
      var bases = document.createElement('div');
      bases.classList.add('bases');

      bases.innerHTML = '<span class="first"></span><span class="second"></span><span class="third"></span>';
      return bases;
    },

    addOutIndicators: function () {
      var wrapper = document.createElement('section');
      wrapper.classList.add('outs');
      wrapper.innerHTML = '<span></span><span></span><span></span>';

      return wrapper;
    },

    createScoreTable: function () {
      var table = document.createElement('table'),
          tbody = document.createElement('tbody'),
          i, j, tr, td;

      for (i = 0; i < 2; i++) {
        tr = document.createElement('tr');
        if (i === 0) {
          tr.classList.add('away');
        } else {
          tr.classList.add('home');
        }

        for (j = 0; j < 5; j++) {
          td = document.createElement('td');
          if (j === 0 && i === 0) {
            td.className = 'inning';
          } else if (j === 0 && i === 1) {
            td.className = 'inning-half';
          } else if (j === 1) {
            td.className = 'team';
          } else if (j === 2 ) {
            td.className = 'score';
          } else if (j === 3) {
            td.className = 'hits';
          } else if (j === 4) {
            td.className = 'errors';
          }
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      table.classList.add('score');
      return table;
    },

    buildHTML: function (data) {
      var wrapper = document.createElement('article'),
          inning = document.createElement('section'),
          home = document.createElement('section'),
          away = document.createElement('section'),
          homeTeam = document.createElement('div'),
          awayTeam = document.createElement('div'),
          homeScore = document.createElement('div'),
          awayScore = document.createElement('div'),
          topBottom = document.createElement('div');

      wrapper.classList.add('game');
      inning.classList.add('inning');
      home.classList.add('home');
      away.classList.add('away');
      homeTeam.classList.add('team');
      awayTeam.classList.add('team');
      homeScore.classList.add('score');
      awayScore.classList.add('score');
      topBottom.classList.add('top-bottom');

      homeTeam.appendChild(document.createTextNode(this.homeTeam));
      awayTeam.appendChild(document.createTextNode(this.awayTeam));

      home.appendChild(homeTeam);
      home.appendChild(homeScore);
      away.appendChild(awayTeam);
      away.appendChild(awayScore);

      wrapper.appendChild(this.createScoreTable());
      wrapper.querySelector('.home .team').appendChild(document.createTextNode(this.homeTeam));
      wrapper.querySelector('.away .team').appendChild(document.createTextNode(this.awayTeam));

      wrapper.appendChild(this.addBases());
      wrapper.appendChild(this.addOutIndicators());

      return wrapper;
    },

    setScores: function (data) {
      var awayScore = data.away_team_runs,
          homeScore = data.home_team_runs;

      this.awayScore = data.away_team_runs;
      this.homeScore = data.home_team_runs;

    },

    setRunners: function (data) {
      var basesIndicators = this.view.querySelector('.bases').getElementsByTagName('span'),
          firstbase = basesIndicators[0],
          secondbase = basesIndicators[1],
          thirdbase = basesIndicators[2];

      if (data.runner_on_1b) {
        firstbase.classList.add('hasrunner');
      } else {
        firstbase.classList.remove('hasrunner');
      }

      if (data.runner_on_2b) {
        secondbase.classList.add('hasrunner');
      } else {
        secondbase.classList.remove('hasrunner');
      }

      if (data.runner_on_3b) {
        thirdbase.classList.add('hasrunner');
      } else {
        thirdbase.classList.remove('hasrunner');
      }

    },

    cancelSubscription: function () {
      pubsub.unsubscribe(this.updateSubscription);
    },

    set status(status) {
      this._status = status;
      // do something else here for status change?
    },

    set homeScore(score) {
      this._homeScore = score;
      this.view.querySelector('.home .score').innerHTML = score;
    },

    set homehits(hits) {
      this._homehits = hits;
      this.view.querySelector('.home .hits').innerHTML = hits;
    },

    set homeerrors(errors) {
      this._homeerrors = errors;
      this.view.querySelector('.home .errors').innerHTML = errors;
    },

    set awayScore(score) {
      this._awayScore = score;
      this.view.querySelector('.away .score').innerHTML = score;
    },

    set awayhits(hits) {
      this._awayhits = hits;
      this.view.querySelector('.away .hits').innerHTML = hits;
    },

    set awayerrors(errors) {
      this._awayerrors = errors;
      this.view.querySelector('.away .errors').innerHTML = errors;
    },

    set inning (aInning) {
      if (aInning[0]) {
        this._inning = aInning[0];
        this.view.querySelector('.inning').innerHTML = this._inning;
      }
      if (aInning[1]) {
        this.view.querySelector('.inning-half').className = 'inning-half ' + (aInning[1]);
      }
    },

    set outs (outs) {
      var outsstr;

      switch (outs) {
        case "0":
        case "default":
          outsstr = '';
          break;
        case "1":
          outsstr = 'one';
          break;
        case "2":
          outsstr = 'two';
          break;
        case "3":
          outsstr = 'three';
          break;
      }

      this.view.querySelector('.outs').className = 'outs ' + outsstr;
    }
  };

  window.Game = Game;

})(jQuery, this);
