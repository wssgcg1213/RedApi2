/**
 * Created by andycall on 15/5/4.
 */

var api = require('../controllers/api'),
    express = require('express'),
    availables = require('../config.json').availablePlugins,
    kebiao = require('redapi-plugin-kebiao');

var router = express.Router();

router.get(['/', '/api', '/api/admin'], function(req, res) {
    res.redirect('/admin');
});

router.post('/test', function(req, res){
    console.log(req.files);
    res.end('123');
});

router.get('/admin', api.index);
router.post('/adminPlugins', api.adminPlugins);

module.exports = router;

