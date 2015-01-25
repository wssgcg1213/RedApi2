var version = '0.0.2';

var jsdom = require('jsdom');
var $ = require('jQuery');
var http = require('http');
var Iconv = require('iconv').Iconv;

function main(xh, pwd, callback) {
    var api_app = 'cyxbs';
    var api_token = 'Q60BCrBDEGsLtdXmTAp1hIPbAg4Aak51pNQQAavydZM=';
    var req = http.request({
        host: "hongyan.cqupt.edu.cn",
        path: "/cyxbs/api/account/" + xh + '?id_num=' + pwd,
        method: 'GET',
        headers: {
            'api_app': api_app,
            'api_token': api_token,
            'Accept': 'text/html'
        }
    }, function(res) {
        res.setEncoding('utf8');
        var data;
        res.on('data', function(chunk) {
            data += chunk;
        })
        res.on('end', function() {
            data = data.toString().substr(9);
            var jsonData = JSON.parse(data);
            jsonData.version = version;
            if (jsonData.status == 0) {
                jsonData.status = 200;
                http.get('http://jwzx.cqupt.edu.cn/pubBjStu.php?searchKey=' + xh, function(jwres) {
                    var buffers = [],
                        size = 0;
                    jwres.on('data', function(chunk) {
                        buffers.push(chunk);
                        size += chunk.length;
                    })

                    jwres.on('end', function() {
                        var buffer = new Buffer(size),
                            pos = 0;
                        for (var i = 0, l = buffers.length; i < l; i++) {
                            buffers[i].copy(buffer, pos);
                            pos += buffers[i].length;

                        }
                        var gbk_to_utf8_iconv = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
                        var utf8_buffer = gbk_to_utf8_iconv.convert(buffer);
                        var doc = utf8_buffer.toString().replace(/&nbsp;/g, '');
                        var tds = $($(doc).find('tr')[1]).find('td');
                        if ($(tds[0]).text() != xh) {
                            callback(null, jsonData);
                        } else {
                            var name = $(tds[1]).text() || '',
                                sex = $(tds[2]).text() || '',
                                classNum = $(tds[3]).text() || '',
                                profess = $(tds[4]).text() || '',
                                college = $(tds[5]).text() || '',
                                grade = $(tds[6]).text() || '';
                            var resultData = {
                                stuNum: xh,
                                idNum: pwd,
                                name: name,
                                gender: sex,
                                classNum: classNum,
                                major: profess,
                                college: college,
                                grade: grade
                            }
                            jsonData.data = resultData;
                            callback && callback(null, jsonData);
                        }
                    });
                });
            } else {
                callback && callback(null, jsonData);
            }
        });
    });
    req.end();
}

function verify(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var rawStuNum = req.body['stu_num'] || req.body['stuNum'];
    var xh = rawStuNum;
    var pwd = req.body['idNum'];
    main(xh, pwd, function(err, data) {
        if (err) return console.log(err);
        if(data.info == "student id error")
            data.status = -100;
        res.end(JSON.stringify(data));
    });
}

verify.type = 'post';
module.exports = verify;