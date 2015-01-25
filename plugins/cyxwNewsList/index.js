/**
 * Created by Liuchenling on 8/25/14.
 */
/**
 * 重邮新闻新闻列表
 * 每次返回15条
 * POST
 * page (int) 页数 从1递增
 * 返回格式: JSON
 * 正常代码: 200;
 * / 错误代码: -1: 内部错误
 * 			  10: 未正常返回或超时
 * 		      20: 输入错误
 */

var version = '14.8.29';
var infoHash = {
    '200': 'Success',
    '-1': 'Inner Error',
    '-10': 'Server Return Invaild Data',
    '-20': 'Invaild param: page'
};

var jsdom = require('jsdom');
var $ = require('jQuery');
var http = require('http');
var Iconv = require('iconv').Iconv;


function main (type, page, callback) {
    type = type || 1;
    page = page || 1;
    //console.time('req');
    var req = http.get('http://219.153.62.79/xwzx/news_type.php?id=' + type + '&page=' + page, function (res){
        var resultData = [];
        var buffers = [], size = 0;
        res.on('data', function (chunk) {
            buffers.push(chunk);
            size += chunk.length;
        });

        res.on('end', function () {
            //console.timeEnd('req');
            //console.time('process');
            if(res.statusCode != 200)
                responseData(-10, function (err, re) {
                    return callback && callback(null, re);
                });

            var buffer = new Buffer(size), pos = 0;
            for(var i = 0, l = buffers.length; i < l; i++) {
                buffers[i].copy(buffer, pos);
                pos += buffers[i].length;
            }
            var gbk_to_utf8_iconv = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
            var utf8_buffer = gbk_to_utf8_iconv.convert(buffer);
            var doc = utf8_buffer.toString().replace(/&nbsp;/g, '');
            var news = [];
            var $article = $(doc).find('table tr td table tr td table tr td table');
            $article.find('tr').each(function () {
                var itemNews = {};

                var $a = $(this).find('a');
                if(!$a.html())return;
                itemNews.id = $a.attr('href').split('id=')[1];
                itemNews.title = $a.attr('title');
                itemNews.date = $(this).find('td:last').text();
                news.push(itemNews);
            });


            responseData(200, type, page, news, function (err, re) {
                callback && callback(null, re);
                //console.timeEnd('process');
            });
        });
    });
    req.end();
}




function responseData (status, type, page, data, callback) {
    if(typeof type == 'function') callback = type;
    var re = {};
    re.status = status || -1;
    re.info = infoHash[status];
    if(re.status == 200){
        re.type = type;
        re.page = page;
        re.data = data;
    }
    re.version = version;
    callback && callback(null, re);
}

function newsList (req, res) {
    res.setHeader('Content-Type','application/json');
    var type = parseInt(req.body['type']) || 1;
    var page = parseInt(req.body['page']) || 1;
    main(type, page, function (err, data) {
        if(err)return console.log(err);
        res.end(JSON.stringify(data));
    });
}

newsList.type = 'post';
newsList.main = main;
module.exports = newsList;
