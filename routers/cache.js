/**
 * Created by andycall on 15/5/4.
 */


var express = require('express'),
    cache = require('../controllers/cache'),
    router = express.Router();


router.all('/api/:plugin', cache.modCache);

module.exports = router;