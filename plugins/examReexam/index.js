var version = '14.8.30';
var jsdom = require('jsdom');
var $ = require('jQuery');
var Iconv = require('iconv').Iconv;
var xml2js = require('xml2js');

function main(xh, pwd, callback) {
    $.post('http://hongyan.cqupt.edu.cn/api/verify', {
        stuNum: xh,
        idNum: pwd
    }, function (v) {
        if(v.status == 200){
            var defaultData = {
                status: 200,
                info: "success",
                data: [],
                stuNum: xh,
                idNum: pwd,
                version: version
            };
            require('http').request({
                host: '202.202.32.206',
                port: 83,
                path: '/new/wx/search.php?type=bkap&xh=' + xh
            }, function (res){
                var buffers = [],
                    size = 0;
                res.on('data', function(chunk) {
                    buffers.push(chunk);
                    size += chunk.length;
                })

                res.on('end', function() {
                    var buffer = new Buffer(size),
                        pos = 0;
                    for (var i = 0, l = buffers.length; i < l; i++) {
                        buffers[i].copy(buffer, pos);
                        pos += buffers[i].length;
                    }
                    var gbk_to_utf8_iconv = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
                    var utf8_buffer = gbk_to_utf8_iconv.convert(buffer);
                    var doc = utf8_buffer.toString().replace(/\"|\t|\n|\r/g, '');
                    var parser = new xml2js.Parser();
                    parser.parseString(doc, function (err, result) {
//                        try {
                            var bkStatusCode = result.jwData.errorCode[0];
                            if (bkStatusCode == 1) {
                                defaultData.info = '没有补考';
                                return callback(null, defaultData);
                            } else if (bkStatusCode == 0) {
                                result.jwData.data[0].item.forEach(function (item) {
                                    console.log(item);
                                    var newData = {};
                                    newData.student = xh;
                                    newData.course = item['课程名'][0];
                                    newData.classroom = item['考场'][0];
                                    newData.seat = item['座位'][0];
                                    newData.date = item['考试日期'][0];
                                    newData.time = item['考试时间'][0];
                                    defaultData.data.push(newData);
                                });
                            }
//                        }catch(e){
//                            console.log(e);
//                        }
                        return callback(null, defaultData);
                    });
                });
            }).end();
        }else{
            v.info = 'verify failed';
            return callback(null ,v);
        }
    });
}

function reexam(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var rawStuNum = req.body['stu_num'] || req.body['stuNum'];
    var xh = rawStuNum;
    var pwd = req.body['idNum'];
    main(xh, pwd, function(err, data) {
        if (err) return console.log(err);
        data.stuNum = xh;
        data.idNum = pwd;
        res.end(JSON.stringify(data));
    });
}

reexam.type = 'post';
module.exports = reexam;