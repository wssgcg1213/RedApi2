/**
 * Created by Liuchenling on 9/18/14.
 */
var http = require('http');

function main(str, callback){
    http.get('http://translate.google.cn/translate_tts?ie=UTF-8&q=%E9%80%97%E6%AF%94%E9%80%97%E6%AF%94&tl=zh-CN&total=1&idx=0&textlen=3&client=t', function(res){
//        res.setEncoding('utf8');
        var buffers = [], size = 0;
        res.on('data', function(chunk) {
            buffers.push(chunk);
            size += chunk.length;
        });
        res.on('end', function() {
            var buffer = new Buffer(size),
                pos = 0;
            for (var i = 0, l = buffers.length; i < l; i++) {
                buffers[i].copy(buffer, pos);
                pos += buffers[i].length;
            }

            return callback(null, buffer);
        });
    }).on('error', function(e){
        console.log('err:', e);
    });
}



function googleMain(req, res){
    res.setHeader('Content-Type','audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    var str = req.body['query'];
    main(str, function(err, data){
        if(err){
            console.log(err);
            return res.end('err');
        }else {
            return res.end(data);
        }
    });
}

googleMain.type = 'post';
module.exports = googleMain;