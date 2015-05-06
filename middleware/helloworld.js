/**
 * Created by andycall on 15/5/7.
 */

function helloworld(req, res, next){
    console.log('helloworld');
    next();
}

module.exports = helloworld;