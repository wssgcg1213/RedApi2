/**
 * Created by Liuchenling on 1/21/15.
 */
var express = require('express');
    path = require('path'),
    bodyParser = require('body-parser'),
    router = require('./modules/router'),
    settings = require('./settings'),
    mongoose = require('mongoose'),
    app = express();

/* engine */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* midddlewares */
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

/* logger middleware */
app.use('/api', require('./modules/logger').logger);

/* redis cacher */
app.use('/api', require('./modules/cacher'));

/* route */
app.use('/', router);

/* error handler */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(require('./modules/logger').errorHandler);

//Connect MongoDB
mongoose.connect(settings.dsn, function(){
    console.log("MongoDB Connected");
});

/* environment settings */
process.env.PORT = settings.port;

module.exports = app;
