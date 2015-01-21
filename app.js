/**
 * Created by Liuchenling on 1/21/15.
 */
var express = require('express');
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    errorHandler = require('./modules/errorHandler'),
    apiRoutes = require('./routes/api'),
    panelRoutes = require('./routes/panel'),
    settings = require('./settings'),
    app = express();

/* EJS */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* midwares */
app.use(favicon());
app.use(logger('dev'));
app.use(session({
    secret: 'hongyanredrock',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* route */
app.use('/api', apiRoutes);
app.use('/panel', panelRoutes)


/* error handler */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(errorHandler);

/* environment settings */
process.env.PORT = settings.port;

module.exports = app;
