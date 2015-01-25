/**
 * Created by Liuchenling on 1/25/15.
 */
var fs = require('fs');
var model = require('../models/access.model.js');

function log(req, plugin){
    var _access = {
        ip: req.ip || 'unknown',
        requestBody: req.body || '',
        plugin: plugin,
        time: new Date().getTime()
    };
    console.log(_access);
    var access = new model(_access);
    access.save(function(err){
        if(err) return console.log(err);
    });
}

module.exports = log;