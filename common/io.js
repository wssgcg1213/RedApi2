/**
 * Created by andycall on 15/5/4.
 */

var modelAccess = require('../models').Access,
    modelError = require('../models').Error,
    redis = require('./redis'),
    staticFunc = require('./static'),
    getStatic = staticFunc.getStatic,
    EventProxy = require('eventproxy'),
    ee = new EventProxy(),
    pliginEp = new EventProxy();


exports.io = function(io) {
    io.on('connection', function(socket){
        ee.on('accessLogged', function _handler(obj){
            socket.emit('accessLogged', obj);
            getStatic('redis', function(doc){
                if(redis){
                    redis.dbsize(function(err, number){
                        socket.emit('redis', {
                            pool: number,
                            ttl: settings.expire,
                            week: doc.week,
                            today: doc.today,
                            all: doc.all
                        });
                    });
                }else{
                    socket.emit('redis', {
                        pool: 0,
                        ttl: settings.expire,
                        week: doc.week,
                        today: doc.today,
                        all: doc.all
                    });
                }
            });

            getStatic('all', function(doc){
                socket.emit('all', doc);
            });
        });

        ee.on('errorLogged', function _handler(obj){
            socket.emit('errorLogged', obj);
        });

        getStatic('all', function(doc){
            socket.emit('all', doc);
        });

        pliginEp.on('incr', function(obj){
            socket.emit('plugin', obj);
        });

        var redisEp = EventProxy.create('pool', 'mongoRedisRecord', function(pool, obj){
            socket.emit('redis', {
                pool: pool,
                ttl: settings.expire,
                week: obj.week,
                today: obj.today,
                all: obj.all
            });
        });
        getStatic('redis', function(doc){
            redisEp.emit('mongoRedisRecord', doc);
        });
        if(redis){
            redis.dbsize(function(err, number){
                redisEp.emit('pool', number || 0);
            });
        }else{
            redisEp.emit('pool', 0);
        }

        var logEp = EventProxy.create('errorLog', 'accessLog', function(eObjArr, aObjArr){
            socket.emit('logs', {
                accessLog: aObjArr,
                errorLog: eObjArr
            });
        });
        modelAccess.find({}, null, {limit: 30, sort: {timestamp: -1}}, function(err, docs){
            if(err)return console.log(err);
            logEp.emit('accessLog', docs);
        });
        modelError.find({}, null, {limit: 30, sort: {timestamp: -1}}, function(err, docs){
            if(err)return console.log(err);
            logEp.emit('errorLog', docs);
        });
    });
};


exports.ee = ee;
exports.pliginEp = pliginEp;