/**
 * Created by andycall on 15/5/4.
 */


var client = require('../common/redis');
var incrStatic = require('../common/static').incrStatic;
var config = require('../config.json');
var pliginEp = require('../common/io').pliginEp;
var ee = require('../common/io').ee;

var cacheController;

function generateKeyString(path, obj) {
    var arr = [];
    for(var i in obj){
        arr.push(i + '=' + obj[i]);
    }
    return path + "?" + arr.sort().join('&');
}


cacheController = {
    modCache : function(req, res, next) {
        var keyString = generateKeyString(req.path || '', req.body || {});
        client.get(keyString, function (err, text) {
            if (err) {
                return next(err);
            }
            if (text) {
                incrStatic('redis', function(doc){
                    //ee.emit('accessLogged', doc);
                }); //ok logger hint to mongodb
                var obj = JSON.parse(text);
                obj.redis = 'yes';
                res.json(obj);
            } else {
                //劫持json函数
                var _json = res.json;
                res.json = function (obj) {
                    if (obj && obj.status == 200) {
                        client.set(keyString, JSON.stringify(obj));
                        client.expire(keyString, config.expire);
                    }
                    return _json.call(res, obj);
                };
                next();
            }
        });
    }
};


module.exports = cacheController;






