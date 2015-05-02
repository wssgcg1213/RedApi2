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

/* logger middleware */
app.use(require('./logger').logger);

/* redis cacher */
app.use('/api', require('./cacher'));

/* route */
app.use('/', router);

/* error handler */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next){
    res.json({
        status: err.status || 404,
        info: err.info || "plugin not found"
    });
});

//Connect MongoDB
mongoose.connect(settings.dsn, function(){
    console.log("MongoDB Connected");
});

/* environment settings */
process.env.PORT = settings.port;

module.exports = app;
