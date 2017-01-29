var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/hi', function(req, res, next) {
  res.render('hi', { title: 'Hi' });
});

module.exports = router;
