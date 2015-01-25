/**
 * Created by Liuchenling on 9/17/14.
 */
/**
 * Created by Liuchenling on 9/17/14.
 */

var socketio = require('socket.io');
var phantom = require('phantom');
var socketClient = require('socket.io/node_modules/socket.io-client').connect('127.0.0.1:3333');


phantom.create(function (ph) {
    ph.createPage(function (page) {
        page.open("http://i.xiaoi.com/", function (status) {
            if (status != 'success') {
                ph.exit();
                return console.log('can not open url!');
            }
            page.includeJs('http://hongyan.cqupt.edu.cn/cdn/js/396934_socket.io.min.js', function(){
                page.evaluate(function(){
                    var socket = io.connect('http://127.0.0.1:3333');
                    var hijacking = window.__webrobot_processMsg;
                    window.__webrobot_processMsg = function (v) {
                        if(v)
                            socket.emit('gotQuery', v);
                        return hijacking(v)
                    };
                    socket.on('connect', function(){
                        socket.emit('set-browser');
                    });
                    socket.on('fetch-from-browser', function(data){
                        $('#inputArea').val(data.toString());
                        $('#inputButtonDiv').click();
                    });
                }, function(){

                });
            });
        });
    });
});


function robot(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var query = req.body['query'];
    setTimeout(function(){
        var d = {
            status: 100,
            info: 'server initing',
            data: '小帮手正在睡觉(～﹃～)~zZ 勿扰~~!'
        };
        return res.end(JSON.stringify(d));
    }, 2000);
    socketClient.emit('fetch', query);
    socketClient.on('gotQuery', function(data){
        var responseMsg = data && data.body && data.body.content;
        if(responseMsg){
            responseMsg = responseMsg.toString().replace(/小i/g, '小帮手').replace('近期天气状况详情见右侧==>', '').replace(/\[link/g, '<a').replace(/\]/g, '>').replace(/\[\/link/g, '</a').replace(/url=/g, 'href=');
            if(responseMsg.match('xiaoirobot') || responseMsg.match('右侧')){
                responseMsg = '听不懂呢!~~';
            }
            var resObj = {
                status: 200,
                info: 'success',
                data: responseMsg
            };
            return res.end(JSON.stringify(resObj));
        }
        return res.end(JSON.stringify({
            status: 200,
            info: 'unknown',
            data: '听不懂呢!~~'
        }));
    });
}

robot.type = 'post';
module.exports = robot;