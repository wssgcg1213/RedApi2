var express = require('express'),
    router = express.Router(),
    availables = require('../settings').availablePlugins,
    adminCtrl = require('./adminCtrl'),
    modelStatic = require('../models/static.model'),
    EventProxy = require('eventproxy');

router.get(['/', '/api', '/api/admin'], function(req, res) {
    res.redirect('/admin');
});

router.get('/admin', adminCtrl);
router.post('/adminPlugins', function(req, res, next){
    var _args = availables.slice();
    _args.push(function(){
        var data = [].slice.call(arguments);
        return res.json(data);
    });
    var ep = EventProxy.create.apply(this, _args);
    availables.forEach(function(p){
        modelStatic.findOne({key: "plugin-" + p}, function(err, doc){
            if(err) return console.log(err);
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
});

availables.forEach(function(plugin) {
    var ext = require('../plugins/' + plugin + '/index'),
        method = ext.type || 'post';
    router[method]('/api/' + plugin, ext);
});

module.exports = router;
