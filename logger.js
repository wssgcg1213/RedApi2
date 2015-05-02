/*
  Logger 模块
 */

var EventProxy = require('eventproxy'),
    modelAccess = require('./models/access.model'),
    modelError = require('./models/error.model'),
    EventEmitter = require('events').EventEmitter,
    ee = new EventEmitter();

console.log('logger module loaded');

module.exports.io = function(io) {
    ee.on('accessLogged', function(obj){
        console.log('accessLogged', obj);
    });

    ee.on('errorLogged', function(obj){
        console.log('errorLogged', obj);
    });
};

module.exports.logger = function(req, res, next) {
    var _path = req.path.split('/');
    req.logAccess = function() {
        var obj = {
                ip: req.ip,
                requestBody: req.body,
                plugin: _path[_path.length - 1],
                path: req.path,
                timestamp: +new Date()
            },
            m = new modelAccess(obj);

        m.save(function(err){
            if(err){
                return console.log(err);
            }
            ee.emit('accessLogged', obj)
        });
    };

    req.logError = function(msg) {
        var obj = {
                ip: req.ip,
                requestBody: req.body,
                plugin: _path[_path.length - 1],
                message: msg,
                path: req.path,
                timestamp: +new Date()
            },
            m = new modelError(obj);

        m.save(function(err){
            if(err){
                return console.log(err);
            }
            ee.emit('errorLogged', obj)
        });
    };
    //又劫持一次res.json
    var _json = res.json;
    res.json = function(obj){
        if(obj && obj.status == 200){
            req.logAccess();
        }else{
            req.logError(obj.info);
        }
        return _json.call(res, obj);
    };
    next();
};