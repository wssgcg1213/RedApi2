/**
 * Created by Liuchenling on 5/3/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var _static = new Schema({
    key: String,
    today: Number,
    week: Number,
    all: Number
});

module.exports = mongoose.model('static', _static);