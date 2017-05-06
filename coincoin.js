var https = require('https');
var app = require('express')();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var fs = require('fs');
var request = require('request');
var Bot = require('node-telegram-bot-api');
//var parser = require('body-parser');

console.log("cwd: " + process.cwd());

var options = {
   key  : fs.readFileSync('./key.pem', 'utf8'),
   cert : fs.readFileSync('./server.crt', 'utf8')
//	key : fs.readFileSync('./coincoin.key.old', 'utf-8'),
//	cert : fs.readFileSync('./coincoin.pem.old', 'utf-8')
};

var lastUpdateTime = 0;
console.log(lastUpdateTime);
var keys = ['USDT_BTC', 'BTC_ETH'];
var pairs = {};

var token = process.env.COINCOINBOT_TOKEN;
var bot = new Bot(token);
bot.setWebHook(process.env.COINCOINBOT_BASE_URL + '/' + bot.token, './server.crt');
//bot.setWebHook(process.env.COINCOINBOT_BASE_URL + '/' + bot.token, './coincoin.pem.old');

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

var server = https.createServer(options, app);

server.listen(process.env.COINCOINBOT_PORT, function() {
	console.log('server started');
});
