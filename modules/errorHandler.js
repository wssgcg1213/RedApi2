/**
 * Created by Liuchenling on 1/21/15.
 */
function errorHandler (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
}

module.exports = errorHandler;