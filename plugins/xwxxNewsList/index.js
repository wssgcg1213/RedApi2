/**
 * Created by Liuchenling on 8/25/14.
 */
/**
 * 校务信息列表
 * 每次返回15条
 * POST
 * page (int) 页数 从1递增
 * 返回格式: JSON
 * 正常代码: 200;
 * / 错误代码: -1: 内部错误
 * 			  -10: 未正常返回或超时
 * 		      -20: 输入错误
 */

var version = '14.9.3';
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


function main (page, callback) {
    page = page || 1;
    if(page < 0) page = 1;
    //console.time('req');
    $.get('http://oa.cqupt.edu.cn/notify.do?method=queryAllNotify&type=2&curPageNo=' + Math.ceil(page), function (data) {
        var $doc = $(data);
        var $article = $doc.find('.center');
        var news = [];
        try{
            $article.find('li').each(function(n){

                var newsItem = {};
                var $a = $(this).find('a');
                newsItem.title = $a.text();
                newsItem.id = $a.attr('href').split('notifyId=')[1];
                newsItem.date = $(this).find('.left').text();
                news.push(newsItem);
            })
        }catch(e){
            console.log(e);
            responseData(-10, function (err, re) {
                return callback && callback(e.message);
            })
        }
        if(page % 2){
            news = news.slice(10, 20);
        }else{
            news = news.slice(0, 10);
        }
        responseData(200, page, news, function(err, re){
            return callback && callback(null, re);
        })
    });
}




function responseData (status, page, data, callback) {
    if(typeof page == 'function') callback = page;
    var re = {};
    re.status = status || -1;
    re.info = infoHash[status];
    if(re.status == 200){
        re.page = page;
        re.data = data;
    }
    re.version = version;
    callback && callback(null, re);
}

function newsList (req, res) {
    res.setHeader('Content-Type','application/json');
    var page = parseInt(req.body['page']) || 1;
    main( page, function (err, data) {
        if(err)return console.log(err);
        res.end(JSON.stringify(data));
    });
}

newsList.type = 'post';
newsList.main = main;
module.exports = newsList;