var express = require('express'),
    router = express.Router(),
    availables = require('../settings').availablePlugins,
    adminCtrl = require('./adminCtrl');

router.get(['/', '/api', '/api/admin'], function(req, res) {
    res.redirect('/admin');
});

router.get('/admin', adminCtrl);

availables.forEach(function(plugin) {
    var ext = require('../plugins/' + plugin + '/index'),
        method = ext.type || 'post';
    router[method]('/api/' + plugin, ext);
});

module.exports = router;
