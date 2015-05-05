/**
 * Created by andycall on 15/5/5.
 */

var express = require('express');
var router = express.Router();
var plugins = require('../config.json').availablePlugins;
var _ = require('lodash');
var pluginPrefix = 'redapi-plugin-';

_.each(plugins, function(pluginName){
    var plugin = require(pluginPrefix + pluginName.toLowerCase());
    var method = plugin.type;
    router[method]('/api/' + pluginName, plugin);
});

module.exports = router;