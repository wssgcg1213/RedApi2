var express = require('express');
var router = express.Router();
var fs = require('fs');
var EventProxy = require('eventproxy');
var accessLogger = require('../modules/accessLog');
//var ep = EventProxy.create('pl', );

fs.readdir('./plugins', function (err, dirs) {
    if(err) return console.log(err);

    for(var i = 0, len = dirs.length; i < len; i++){
        if(dirs[i][0] == '.') continue;  //隐藏文件过滤
        (function(){
            var handler = require('../plugins/' + dirs[i] + '/index');   //加载入口文件
            var setting;
            try{
                setting = require('../plugins/' + dirs[i] + '/setting');  //加载配置文件
            }catch(e){
                //兼容没有配置文件
                setting = {
                    httpMethod: handler.type
                };
            }

            var type = setting.httpMethod || 'post'; //API 默认为POST方式
            var src = setting.src || dirs[i];
            router[type]('/' + src, function(req, res){
                accessLogger(req, src);
                handler(req, res);
            });   //注册路由
        })();//闭包
    }
});

/* GET home page. */
router.get('/', function(req, res) {
    res.redirect('/panel#redirect');
});

module.exports = router;
