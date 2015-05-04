/**
 * Created by andycall on 15/5/4.
 */

var express = require('express'),
    loggerController = require('../controllers/logger'),
    loggerRouter = express.Router();



loggerRouter.all('/api/:plugin',  loggerController.increase, loggerController.index);


module.exports = loggerRouter;