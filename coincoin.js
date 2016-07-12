if (process.env.NODE_ENV == 'production')
  require('@google/cloud-debug');

var https = require('https');
var http = require('http');
var app = require('express')();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var fs = require('fs');
var request = require('request');
var Bot = require('node-telegram-bot-api');
//var parser = require('body-parser');

// var options = {
//   key  : fs.readFileSync(process.env.SSL_KEY),
//   cert : fs.readFileSync(process.env.SSL_PEM)
// };

var lastUpdateTime = 0;
console.log(lastUpdateTime);
var keys = ['USDT_BTC', 'BTC_ETH'];
var pairs = {};
var adCount = 0;
var AD_COUNT_TRIGGER = 0;

var token = process.env.BOT_TOKEN;
var bot = new Bot(token);

var BOT_URL = 'https://' + process.env.GAE_APPENGINE_HOSTNAME + '/' + token;
console.log(BOT_URL);
bot.setWebHook(BOT_URL);

// Any kind of message
bot.onText(/\/coin/, function (msg, match) {

  var now = (new Date).getTime();
  if ((now - lastUpdateTime) > 60000) {

    request.get('https://poloniex.com/public?command=returnTicker', {json: true}, function(err, resp, body) {

      lastUpdateTime = now;

      pairs = body;
      console.log(JSON.stringify(pairs))
      output(msg);
    });

  } else {
    output(msg);
  }

  adCount++;
  if (adCount >= AD_COUNT_TRIGGER) {
    bot.sendPhoto(msg.chat.id, './ads/genesis-1.png');
    bot.sendMessage(msg.chat.id, '<a href="https://www.genesis-mining.com/a/16526">Click here to start mining now!</a>', {parse_mode: 'HTML'});
    adCount = 0;
  }
});

function output(msg) {
  var s = '';
  var fromId = msg.chat.id;
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    console.log(key);
    s += key + ": " + pairs[key].last + '\n';
  }
  bot.sendMessage(fromId, s);
}

app.post('/' + token, function (req, res) {
  console.log('connected!');
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.all('/', function (req, res) {
  console.log('slash');
  res.end('hi');
});

var server = http.createServer(app);

server.listen(process.env.PORT, process.env.IP, function() {
	console.log('server started');
});
