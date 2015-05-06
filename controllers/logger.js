/**
 * Created by andycall on 15/5/4.
 */

var loggerController,
    modelAccess = require('../models').Access,
    modelError = require('../models').Error,
    incrStatic = require('../common/static').incrStatic,
    //EventProxy = require('eventproxy'),
    pliginEp = require('../common/io').pliginEp,
    ee = require('../common/io').ee;


loggerController = {
    index : function(req, res, next) {
        var _path = req.path.split('/');
        req.plugin = _path[_path.length - 1] || '';//redis缓存之后 进不到这里
        if(req.plugin){
            incrStatic(req.plugin, function(doc){
                pliginEp.emit('incr', doc);
            });
        }
        req.logAccess = function() {
            var obj = {
                    ip: req.ip,
                    requestBody: req.body,
                    plugin: _path[_path.length - 1],
                    path: req.path.replace(/^\/api/, ''),
                    timestamp: +new Date()
                },
                m = new modelAccess(obj);

            m.save(function(err){
                if(err){
                    return console.log(err);
                }
                ee.emit('accessLogged', obj);
            });
        };

        req.logError = function(msg) {
            var obj = {
                    ip: req.ip,
                    requestBody: req.body,
                    plugin: _path[_path.length - 1],
                    message: msg,
                    path: req.path.replace(/^\/api/, ''),
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
    },
    increase : function(req, res, next) {
        incrStatic('all', function(){
            next();
        });
    }
};


module.exports = loggerController;


