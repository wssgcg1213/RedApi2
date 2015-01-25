/**
 * 空教室查询
 * POST
 * roomNum (int) 教室
 * 返回格式: JSON
 * 正常代码: 200;
 * / 错误代码: -1: 内部错误
 * 			  10: 教务在线未正常返回或超时
 * 		      20: 输入错误
 */

var version = '0.0.2';
var infoHash = {
    '200': 'Success',
    '-1': 'Inner Error',
    '-10': 'Jwzx Return Invaild Data',
    '-20': 'Invaild param: roomNum'
};

var jsdom = require('jsdom');
var $ = require('jQuery');
var http = require('http');
var Iconv = require('iconv').Iconv;

function roomEmptyMain(opt, callback) {
    if (!opt) responseData(-20, function(err, re) {
        return callback && callback(null, re);
    });
    //console.time('req');
    var req = http.request({
        host: 'jwzx.cqupt.edu.cn',
        path: '/showEmptyRoom.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, function(res) {
        var resultData = [];
        var buffers = [],
            size = 0;
        res.on('data', function(chunk) {
            buffers.push(chunk);
            size += chunk.length;
        })

        res.on('end', function() {
            //console.timeEnd('req');
            //console.time('process');
            if (res.statusCode != 200)
                responseData(-10, function(err, re) {
                    return callback && callback(null, re);
                });

            var buffer = new Buffer(size),
                pos = 0;
            for (var i = 0, l = buffers.length; i < l; i++) {
                buffers[i].copy(buffer, pos);
                pos += buffers[i].length;
            }
            var gbk_to_utf8_iconv = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
            var utf8_buffer = gbk_to_utf8_iconv.convert(buffer);
            var doc = utf8_buffer.toString().replace(/&nbsp;/g, '');
            var roomEmpty = [],
                roomEmptyRaw = [];
            $(doc).find('td').each(function() {
                roomEmptyRaw.push($(this).text())
            });
            roomEmptyRaw.forEach(function(item) {
                var classroom = item.split('(')[0];
                if (roomEmpty.indexOf(classroom) >= 0) return;
                roomEmpty.push(classroom);
            });

            responseData(200, roomEmpty, function(err, re) {
                callback && callback(null, re);
                //console.timeEnd('process');
            });
        });
    });
    req.write(parsePostData(opt.xq, opt.sd, opt.rs, opt.jxl, opt.zc));
    req.end();
}

/**
 * [返回Urlencod POST DATA]
 * @param  {[type]} xq  [星期]
 * @param  {[type]} sd  [节数]
 * @param  {[type]} rs  [容纳人数]
 * @param  {[type]} jxl [教学楼]
 */
function parsePostData(xq, sd, rs, jxl, zc) {
    var sd_hash = ['1212', '3412', '5634', '7856', '9078', 'ab90'];
    var rs_hash = ['0_600', '1_73', '73_120', '120_200', '200_600'];
    xq = xq || new Date().getDay();
    sd = sd || 0;
    sd = sd_hash[sd];
    rs = rs || 0;
    rs = rs_hash[rs];
    jxl = jxl || 0;
    zc = zc || 0;
    return 'xq=' + xq + '&sd=' + sd + '&rs=' + rs + '&jxl=' + jxl + '&zc=' + zc;
}

function parseText(raw) {
    return $(raw).text();
}

function responseData(status, data, callback) {
    if (typeof data == 'function') callback = data;
    var re = {};
    re.status = status || -1;
    re.info = infoHash[status];
    if (re.status == 200) {
        re.data = data;
    }
    re.version = version;
    callback && callback(null, re);
}

/**
 * 插件主函数
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function roomEmpty(req, res) {
    res.setHeader('Content-Type', 'application/json');
    roomEmptyMain({
        xq: req.body['weekdayNum'],
        sd: req.body['sectionNum'],
        //rs: req.body[''],   //人数限制, 没有要求
        jxl: req.body['buildNum'],
        zc: req.body['week']
    }, function(err, data) {
        if (err) return console.log(err);
        data.weekdayNum = req.body['weekdayNum'];
        data.sectionNum = req.body['sectionNum'];
        data.buildNum = req.body['buildNum'];
        data.week = req.body['week'];
        res.end(JSON.stringify(data));
    });
}

roomEmpty.type = 'post';
module.exports = roomEmpty;