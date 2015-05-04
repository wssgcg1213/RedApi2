//var express = require('express'),
//    router = express.Router(),
//    availables = require('../config.json').availablePlugins,
//    //adminCtrl = require('./adminCtrl'),
//    //EventProxy = require('eventproxy'),
//    getStatic = require('./logger').getStatic;
////
//availables.forEach(function(plugin) {
//    var ext = require('../plugins/' + plugin + '/index'),
//        method = ext.type || 'post';
//    router[method]('/api/' + plugin, ext);
//});
//
//module.exports = router;
