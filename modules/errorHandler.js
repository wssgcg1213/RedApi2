/**
 * Created by Liuchenling on 1/21/15.
 */

var fs = require('fs');

function format(error, req){
    var arr = [];
    arr.push(error.status || 500);
    arr.push(error.message);
    arr.push(req.ip);
    arr.push(req.url);
    arr.push(new Date().getTime());
    return arr.join('#') + "\n";
}

function errorHandler (err, req, res, next) {
    console.log(req.url);
    fs.appendFile('logs/error.log', format(err, req), function(e){
        if(e)console.log(e);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = errorHandler;