var express = require('express');
var router = express.Router();
var fs = require('fs');
var EventProxy = require('eventproxy');

router.get('/', function(req, res) {
    res.render('index', {title: "this is title"});
});

module.exports = router;
