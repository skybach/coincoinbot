var https = require('https');
var app = require('express')();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var fs = require('fs');
var request = require('request');
var Bot = require('node-telegram-bot-api');
//var parser = require('body-parser');

var options = {
   key  : fs.readFileSync('coincoin.key'),
   cert : fs.readFileSync('coincoin.pem')
};

var lastUpdateTime = 0;
console.log(lastUpdateTime);
var keys = ['USDT_BTC', 'BTC_ETH'];
var pairs = {};

var token = '216666846:AAGpVeq6_BEOAFF4IvFj801jyTbhHvH57ck';
var bot = new Bot(token);
bot.setWebHook('https://www.skyhiggs.com:88/' + bot.token, 'coincoin.pem');

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

});

function output(msg) {
  var fromId = msg.chat.id;
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    console.log(key);
    bot.sendMessage(fromId, key + ": " + pairs[key].last);
  }
}

app.post('/' + token, function (req, res) {
  console.log('connected!');
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

var server = https.createServer(options, app);

server.listen(9999, function() {
	console.log('server started');
});
