/**
 * Created by Liuchenling on 1/21/15.
 */
var express = require('express');
    path = require('path'),
    bodyParser = require('body-parser'),
    router = require('./routers'),
    settings = require('./config.json'),
    pluginManager = require('./common/pluginManager'),
    app = express();

/* engine */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* midddlewares */
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));


/* route */
app.use(router.logger);
app.use(router.cache);
app.use(router.api);

/* plugin */

app.use(pluginManager);

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

/* environment settings */
process.env.PORT = settings.port;

module.exports = app;
