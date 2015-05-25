/**
 * Created by Liuchenling on 1/21/15.
 */
var express = require('express');
    path = require('path'),
    bodyParser = require('body-parser'),
    router = require('./routers'),
    settings = require('./config.json'),
    pluginManager = require('./common/pluginManager'),
    middleWareManager = require('./middleware'),
    app = express();

var __root = '/redapi2';

/* engine */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* midddlewares */
app.use(__root, bodyParser.urlencoded());
app.use(__root, express.static(path.join(__dirname, 'public')));

// custom middleware
//middleWareManager(app);

/* route */
app.use(__root, router.logger);
app.use(__root, router.cache);
app.use(__root, router.api);

/* plugin */

app.use(__root, pluginManager);

///* error handler */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next){
    res.json({
        status: err.status || 404,
        info: err.info || "plugin and method not match"
    });
});

module.exports = app;
