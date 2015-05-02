/**
 * Created by Liuchenling on 5/2/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var _error = new Schema({
    ip: String,
    requestBody: Object,
    plugin: String,
    path: String,
    message: String,
    timestamp: Number
});

module.exports = mongoose.model('error', _error);