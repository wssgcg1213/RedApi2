var express = require('express');
var router = express.Router();
var availables = require('./settings').availablePlugins;

router.get('/', function(req, res) {
    res.render('index', {title: "this is title"});
});

availables.forEach(function(plugin) {
    var ext = require('./plugins/' + plugin + '/index'),
        method = ext.type || 'post';
    router[method]('/api/' + plugin, ext);
});

module.exports = router;
