/**
 * 教务在线新闻列表
 * 每次返回15条
 * POST
 * page (int) 页数 从1递增
 * 返回格式: JSON
 * 正常代码: 200;
 * / 错误代码: -1: 内部错误
 * 			  10: 教务在线未正常返回或超时
 * 		      20: 输入错误
 */

var version = '15.05.04';
var infoHash = {
	'200': 'Success',
	'-1': 'Inner Error',
	'-10': 'Jwzx Return Invaild Data',
	'-20': 'Invaild param: page'
};

var jsdom = require('jsdom');
var $ = require('jQuery');
var http = require('http');
var Iconv = require('iconv').Iconv;


function main (page, callback) {
	if(!page) responseData(-20, function (err, re) {
			return callback && callback(null, re);
		});

	var req = http.request({
		host: 'jwzx.cqupt.edu.cn',
		path: '/pubFileList.php?currentPageNo=' + page
	}, function (res){
		var buffers = [], size = 0;
		res.on('data', function (chunk) {
			buffers.push(chunk);
			size += chunk.length;
		});
	
		res.on('end', function () {
			if(res.statusCode != 200) 
				responseData(-10, function (err, re) {
					return callback && callback(null, re);
				});

			var buffer = Buffer.concat(buffers, size);
			var gbk_to_utf8_iconv = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
	        var utf8_buffer = gbk_to_utf8_iconv.convert(buffer);
	        var doc = utf8_buffer.toString().replace(/&nbsp;/g, '');
	        var news = [];
	        $(doc).find('tr').each(function (ntr) {
	        	if(ntr == 0 || ntr == 16)return;
	        	var itemNews = {};
	        	$(this).find('td').each(function (ntd) {
	        		if(ntd == 0) {
	        			itemNews.id = $(this).find('a').attr("href").split('showfilecontent.php?id=')[1];
	        			itemNews.title = $(this).text();
	        		}
	        		if(ntd == 1) itemNews.date = $(this).text();
	        		if(ntd == 2) itemNews.read = $(this).text();
	        	});
	        	news.push(itemNews);
	        });
	        
	        responseData(200, page, news, function (err, re) {
	        	callback && callback(null, re);
	        });
		});
	});
	req.end();
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

function jwList (req, res) {
	var page = parseInt(req.body['page']) || 1;
	main(page, function (err, data) {
		if(err)return console.log(err);
		res.json(data);
	});
}

jwList.type = 'post';
module.exports = jwList;