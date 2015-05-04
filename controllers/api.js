/**
 * Created by andycall on 15/5/4.
 */

var getStatic = require('../common/static').getStatic,
    config = require('../config.json'),
    availables = config.availablePlugins,
    EventProxy = require('eventproxy'),
    adminControllers;



adminControllers = {
    index : function(req, res){
        return res.render('index', {
            title: "aaa"
        });
    },
    adminPlugins : function(req, res, next){
        var _args = availables.slice();
        _args.push(function(){
            var data = [].slice.call(arguments);
            return res.json(data);
        });
        var ep = EventProxy.create.apply(this, _args);
        availables.forEach(function(p){
            getStatic(p, function(doc){
                ep.emit(p, {
                    plugin: p,
                    today: doc.today,
                    week: doc.week,
                    all: doc.all
                });
            });
        });

        setTimeout(function(){
            var e = new Error("timeout in getting plugins");
            next(e);
        }, 2500);//timeout
    }
};

module.exports = adminControllers;