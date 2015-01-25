/**
 * Created by Liuchenling on 8/25/14.
 */
/**
 * 校务公告新闻列表
 * 每次返回15条
 * POST
 * page (int) 页数 从1递增
 * 返回格式: JSON
 * 正常代码: 200;
 * / 错误代码: -1: 内部错误
 * 			  -10: 未正常返回或超时
 * 		      -20: 输入错误
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


function main (page, callback) {
    page = page || 1;
    if(page < 0) page = 1;
    //console.time('req');
    $.post('http://202.202.32.35/cqupt/List.jsp?Type=news', {
        TITLE: '',
        PAGE_SQL: "NC_ID,NC_TITLE,NC_DEPT,PUSER_TIME _!!_ NC_ID _!!_ T_NOTIC _!!_ NC_MODE='notic' AND NC_TITLE LIKE '%%' _!!_ ORDER BY PUSER_TIME DESC",
        cur_page: page,
        pageSize: 15,
//        page: 2
    }, function (data) {
        var $doc = $(data);
        var $article = $doc.find('table tr td table tr td table tr td table');
        var news = [];
        try{
            $article.find('tr').each(function(n){
                if(n < 7 || n > 21) return;
                var newsItem = {};
                var $a = $(this).find('a');
                newsItem.title = $a.text();
                newsItem.id = $a.attr('href').split('ID=')[1];
                newsItem.date = $(this).find('td:last').text();
                news.push(newsItem);
            })
        }catch(e){
            console.log(e);
            responseData(-10, function (err, re) {
                return callback && callback(e.message);
            })
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
module.exports = newsList;