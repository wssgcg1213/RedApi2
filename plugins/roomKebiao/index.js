/**
 * 教室课表
 * POST
 * roomNum (int) 教室
 * 返回格式: JSON
 * 正常代码: 200;
 * / 错误代码: -1: 内部错误
 * 			  10: 教务在线未正常返回或超时
 * 		      20: 学号输入错误
 */


var version = '0.0.2';
var defaultTerm = '2014-2015学年1学期';
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

function roomKebiaoMain(room, callback) {
    if (!room) responseData(-20, function(err, re) {
        return callback && callback(null, re);
    });
    //console.time('req');
    http.get("http://jwzx.cqupt.edu.cn/showRoomKebiao.php?room=" + room, function(res) {
        var hash_day = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
        var hash_course = ["一二节", "三四节", "五六节", "七八节", "九十节", "十一二"];
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
            var roomKebiao = [
                [],
                [],
                [],
                [],
                [],
                [],
                []
            ];
            var tbs = $(doc).find('table');
            var termRaw = tbs.find('.list_text').text(); //学期
            var term = termRaw ? termRaw.split(' ')[0] : defaultTerm;
            /* 普通课表 */
            var kebiao = tbs.find('tr');
            for (var n = 5; n <= 10; n++) {
                $(kebiao[n]).find('td').each(function(ntd, _td) {
                    if (ntd == 0) return;
                    roomKebiao[ntd - 1].push($(this).html().split('<font color="336699"><br><br></font>'));
                });
            }
            try {
                for (var day = 0; day <= 6; day++)
                    for (var course = 0; course <= 5; course++) {
                        var multiCourse = roomKebiao[day][course].toString().split(',');
                        multiCourse.forEach(function(item) {
                            //console.log(item);
                            if (!item) return;
                            var c = item.split(/<\w*>/g);
                            if (!parseText(c[0])) return;
                            var rawWeek = parseText(c[2]) || c[2];
                            var week = parseWeek2(rawWeek);
                            var d = {
                                //hash_day: day,
                                //hash_lesson: course,
                                //day: hash_day[day],
                                //lesson: hash_course[course],
                                course: parseText(c[0]),
                                teacher: c[1] && c[1].trim(),
                                classroom: room,
                                begin_lesson: 2 * course + 1,
                                end_lesson: 2 * course + 2,
                                begin_week: week.begin,
                                end_week: week.end,
                                weekday: day + 1,
                                status: '正常',
                                term: term
                            }
                            if (d && d.course) {
                                if (c[3].match('连上三节')) d.end_lesson++;
                                if (c[3].match('连上四节')) d.end_lesson += 2;
                                resultData.push(d);
                            }
                        });
                    }
            } catch (e) {
                console.log(e);
                responseData(-10, function(err, re) {
                    return callback && callback(null, re);
                });
            }

            responseData(200, room, term, resultData, function(err, re) {
                callback && callback(null, re);
                //console.timeEnd('process');
            });
        });
    });
}


function parseText(raw) {
    return $(raw).text();
}

/**
 * 工具函数, 用来解析周数, 默认行课周1 - 20周
 * @param  {String} str [eg. '1-17周单周']
 * @return {Array}     [返回一个数组, 里面包含了上课的周数]
 */
function parseWeek2(str) {
    if (!str || typeof str != 'string') return;
    var model, begin, end, t, week = [];
    t = str.split('-');
    begin = parseInt(t[0]);
    end = parseInt(t[1]);
    if (begin && !end) return {
        all: [begin],
        begin: begin,
        end: begin
    };
    var single = parseInt(str);
    if (single !== single) { //NaN
        var testSingle = str.match(/\w/g);
        if (testSingle) {
            var s = parseInt(testSingle.join(''));
            return {
                all: [s],
                begin: s,
                end: s
            }
        }
    }
    begin = begin || 1;
    end = end || 20;
    if (str.indexOf('双周') >= 0) {
        model = 'double';
        begin = begin % 2 == 0 ? begin : begin + 1;
        for (var i = begin; i <= end; i += 2)
            week.push(i);
    } else if (str.indexOf('单周') >= 0) {
        begin = begin % 2 == 1 ? begin : begin + 1;
        for (var i = begin; i <= end; i += 2)
            week.push(i);
    } else {
        for (var i = begin; i <= end; i++)
            week.push(i);
    }
    return {
        all: week,
        begin: begin,
        end: end
    };
}


function responseData(status, room, term, data, callback) {
    if (typeof room == 'function') callback = room;
    var re = {};
    re.status = status || -1;
    re.info = infoHash[status];
    if (re.status == 200) {
        re.term = term || defaultTerm;
        re.room = room;
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
function roomKebiao(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var rawRoomNum = req.body['roomNum'];
    roomKebiaoMain(rawRoomNum, function(err, data) {
        if (err) return console.log(err);
        data.roomNum = rawRoomNum;
        res.end(JSON.stringify(data));
    });
}

roomKebiao.type = 'post';
module.exports = roomKebiao;