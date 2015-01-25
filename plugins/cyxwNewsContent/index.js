/**
 * 新闻中心新闻内容
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
	var req = http.get('http://xwzx.cqupt.edu.cn/xwzx/news.php?id=' + id, function (res){
	    var resultData = [];
		var buffers = [], size = 0;
		res.on('data', function (chunk) {
			buffers.push(chunk);
			size += chunk.length;
		})
	
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
	        var news = {};
	        var $doc = $(doc);
            var $newsContent = $doc.find('#news_content');
	        try{
	        	news.title = $doc.find('title').text().split('::')[1];
	        	news.content = $newsContent.text();
                news.pics = [];
                $newsContent.find('img').each(function(){
                    news.pics.push('http://xwzx.cqupt.edu.cn' + $(this).attr('src'));
                });
	        }catch(e){
                console.log(e);
	        	responseData(-10, function (err, re) {
	        		return callback && callback(null, re);
	        	})
	        }
	        responseData(200, id, news, function (err, re) {
	        	callback && callback(null, re);
	        	//console.timeEnd('process');
	        });
		});
	});
	req.end();
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

function jwContent (req, res) {
	res.setHeader('Content-Type','application/json');
	var id = req.body['id'];
	main(id, function (err, data) {
		if(err)return console.log(err);
		res.end(JSON.stringify(data));
	});
}

jwContent.main = main;
jwContent.type = 'post';
module.exports = jwContent;