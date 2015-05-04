/**
 * Created by Liuchenling on 5/2/15.
 */
/*
redis cacher
 */
var redis = require('redis'),
    client = redis.createClient(),
    s = require('../config.json'),
    incrStatic = require('./logger').incrStatic;
    
//client.on("connect", function () {
//    client.flushdb();
//    console.log("Redis Connected & FlushedDB");
//});
//client.on("error", function (err) {
//    console.log("Redis Error " + err);
//});
//
///**
// * 暴露到全局方便使用
// */
//global.redisClient = client;

function generateKeyString(path, obj) {
    var arr = [];
    for(var i in obj){
        arr.push(i + '=' + obj[i]);
    }
    return path + "?" + arr.sort().join('&');
}

module.exports = function(req, res, next){
    var keyString = generateKeyString(req.path || '', req.body || {});
    client.get(keyString, function(err, text){
        if(err){return next(err);}
        if(text){
            incrStatic('redis'); //ok logger hint to mongodb
            var obj = JSON.parse(text);
            obj.redis = 'yes';
            res.json(obj);
        }else{
            //劫持json函数
            var _json = res.json;
            res.json = function(obj){
                if(obj && obj.status == 200){
                    client.set(keyString, JSON.stringify(obj));
                    client.expire(keyString, s.expire);
                }
                return _json.call(res, obj);
            };
            next();
        }
    });
}