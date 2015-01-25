/**
 * 校务公告新闻内容
 * POST
 * id (string) 
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
	'-20': 'Invaild param: id'
};

var jsdom = require('jsdom');
var $ = require('jQuery');
var http = require('http');
var Iconv = require('iconv').Iconv;


function main (id, callback) {
	if(!id) responseData(-20, function (err, re) {
			return callback && callback(null, re);
		});
	//console.time('req');
    $.get('http://202.202.32.35/cqupt/news.jsp?Type=news&ID=' + id, function (data){
        var $doc = $(data);
        var $article = $doc.find('table tr td table tr td table tr td table');
        var news = {};
        $article.find('tr').each(function(n){
            if(n == 5){
                news.title = $(this).find('b').text();
            }
            if(n == 6){
                news.content = $(this).text();
                news.pics = [];
            }
        });
        responseData(200, id, news, function (err, re){
            callback && callback(null, re);
        })
    });
}




function responseData (status, id, data, callback) {
	if(typeof id == 'function') callback = id;
	var re = {};
	re.status = status || -1;
	re.info = infoHash[status];
	if(re.status == 200){
		re.id = id;
		re.data = data;
	}
	re.version = version;
	callback && callback(null, re);
}

function xwggNews (req, res) {
	res.setHeader('Content-Type','application/json');
	var id = req.body['id'];
	main(id, function (err, data) {
		if(err)return console.log(err);
		res.end(JSON.stringify(data));
	});
}

xwggNews.type = 'post';
module.exports = xwggNews;