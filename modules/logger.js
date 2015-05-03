/*
  Logger 模块
 */

var EventProxy = require('eventproxy'),
    modelAccess = require('../models/access.model.js'),
    modelError = require('../models/error.model.js'),
    staticModel = require('../models/static.model.js'),
    //EventEmitter = require('events').EventEmitter,
    ee = new EventProxy();

console.log('logger module loaded');

//type 有all redis 其他字符串均为'plugin-' + type
function getStatic(type, cb){
    if(type !== 'all' && type !== 'redis'){
        type = "plugin-" + type;
    }
    staticModel.findOne({key: type}, function(err, doc){
        if(err)return console.log(err);
        if(doc){
            cb && cb(doc);
        }else{
            var _o = new staticModel({
                key: type,
                today: 0,
                week: 0,
                all: 0
            });
            _o.save(function(err, doc){
                if(err)return console.log(err);
                cb && cb(doc);
            });
        }
    });
}

function incrStatic(type, cb){
    if(type !== 'all' && type !== 'redis'){
        incrStatic('all'); //给总访问量也加一次
        type = "plugin-" + type;
    }
    staticModel.findOneAndUpdate({key: type}, {$inc: {
        today: 1,
        week: 1,
        all: 1
    } }, function(err, doc){
        if(err)return console.log(err);
        if(doc){
            cb && cb(doc);
        }else{
            var _o = new staticModel({
                key: type,
                today: 1,
                week: 1,
                all: 1
            });
            _o.save(function(err, doc){
                if(err)return console.log(err);
                cb && cb(doc);
            });
        }
    });
}

function clearStatic(dayOrWeek, cb){
    if(dayOrWeek === 'day'){
        if((new Date()).getDay() === 1){//monday
            clearStatic('week', cb);
        }
        staticModel.where().update({}, {today: 0}, { multi: true }, function(err, doc){
            if(err)return console.log(err);
            cb && cb(doc);
        });
    }else if(dayOrWeek === 'week'){
        staticModel.where().update({}, {week: 0}, { multi: true }, function(err, doc){
            if(err)return console.log(err);
            cb && cb(doc);
        });
    }
}

/**
 * 每天0点0分0秒自动清空today
 */
;(function(){
    var d = new Date();
    var firstInterval = new Date(d.getFullYear() + ' ' + (d.getMonth()+1) + ' ' + (d.getDate() + 1) +' 00:00:00') - d;
    setTimeout(function(){
        clearStatic('day');
        setInterval(function(){
            clearStatic('day');
        }, 3600 * 24 * 1000);//one day
    }, firstInterval);
})();

module.exports.incrStatic = incrStatic;
module.exports.getStatic = getStatic;

module.exports.io = function(io) {
    io.on('connection', function(socket){
        ee.on('accessLogged', function _handler(obj){
            socket.emit('accessLogged', obj);
        });

        ee.on('errorLogged', function _handler(obj){
            socket.emit('errorLogged', obj);
        });

        socket.emit('redis', {
            ttl: 240,
            pool: 1234,
            today: 5345,
            week: 34543,
            all: 34543
        });
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

module.exports.errorHandler = function(err, req, res, next){
    res.json({
        status: err.status || 404,
        info: err.info || "plugin and method not match"
    });
};