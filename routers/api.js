/**
 * Created by andycall on 15/5/4.
 */

var api = require('../controllers/api'),
    express = require('express'),
    availables = require('../config.json').availablePlugins,
    kebiao = require('redapi-plugin-kebiao');





var router = express.Router();

//availables.forEach(function(plugin) {
//    var ext = require('../plugins/' + plugin + '/index'),
//        method = ext.type || 'post';
//    router[method]('/api/' + plugin, ext);
//});

var method = kebiao.type;
router[method]('/api/' + 'kebiao', kebiao);
router.post('/api/jwNewsList', require('redapi-plugin-jwnewslist'));

router.get(['/', '/api', '/api/admin'], function(req, res) {
    res.redirect('/admin');
});

router.get('/admin', api.index);
router.post('/adminPlugins', api.adminPlugins);

module.exports = router;

