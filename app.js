/**
 * Created by Liuchenling on 1/21/15.
 */
var express = require('express');
    path = require('path'),
    bodyParser = require('body-parser'),
    router = require('./router'),
    settings = require('./settings'),
    mongoose = require('mongoose'),
    hbs = require('express-hbs'),
    app = express();

/* engine */
app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/* midddlewares */
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

/* route */
app.use('/', router);

/* error handler */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
//app.use(errorHandler);

//Connect MongoDB
//mongoose.connect(settings.dsn);

/* environment settings */
process.env.PORT = settings.port;

module.exports = app;
