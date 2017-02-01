var express = require('express');
var app = express();

app.set('view engine', 'jade')

app.get('/', function (req, res) {
  res.render('index', {title: 'Главнаяя страница'});
});

app.listen(2400, function () {
  console.log('Example app listening on port 2400!');
});