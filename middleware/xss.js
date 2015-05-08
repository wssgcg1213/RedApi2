/**
 * Created by andycall on 15/5/7.
 */
var xss = require('xss');
var _ = require('lodash');


function xssFilter(req, res, next) {
    var method = req.method;

    if(req.method && /get/i.test(req.method)){
        req.query = JSON.parse(xss(JSON.stringify(req.query)));
    } else if(/post/i.test(req.method)) {
        req.body = JSON.parse(xss(JSON.stringify(req.body)));
    }

    next();
}

module.exports = xssFilter;