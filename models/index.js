/**
 * Created by andycall on 15/5/4.
 */

var mongoose = require('mongoose');
var config = require("../config.json");

mongoose.connect(config.dsn, function(err){
    if (err) {
        console.error('connect to %s error: ', config.dsn, err.message);
        process.exit(1);
    } else{
        console.log('mongoseDB connected');
    }
});

require('./access.model');
require('./error.model');
require('./static.model');
exports.Access = mongoose.model('access');
exports.Error = mongoose.model('error');
exports.Static = mongoose.model('static');