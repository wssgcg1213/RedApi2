/**
 * Created by andycall on 15/5/4.
 */

var redis = require("redis"),
    client = redis.createClient(),
    config = require('../config.json');


client.on("connect", function (err) {
    if(err){
        console.log('redis connect error');
        throw new Error(err);
    }
    client.flushdb();
    console.log("Redis Connected & FlushedDB");
});

client.on("error", function (err) {
    console.log("Redis Error " + err);
});


module.exports = client;


