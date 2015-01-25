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

var version = '14.8.30';
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
    http.request({
        host: "oa.cqupt.edu.cn",
        path: '/notify.do?method=oneNotify&notifyId=' + id + '&type=2',
        method: 'GET',
    }, function resCb(res) {
        res = res || arguments[0];
        res.setEncoding('utf8');
        var data;
        res.on('data', function(chunk) {
            data += chunk;
        })
        res.on('end', function() {
            var $doc = $(data);
            var $article = $doc.find('.content_area');
            var news = {};
            news.title = $article.find('.content_title').text();
            news.content = $article.find('table:last').text();
            responseData(200, id, news, function (err, re){
                callback && callback(null, re);
            })

        });
    }).end();
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
xwggNews.main = main;
module.exports = xwggNews;
