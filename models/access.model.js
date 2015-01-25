/**
 * Created by Liuchenling on 1/25/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var _access = new Schema({
    ip: String,
    requestBody: Object,
    plugin: String,
    time: String
});

module.exports = mongoose.model('access', _access);
