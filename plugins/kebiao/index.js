// 重邮课表插件
// HTTP方法: POST
// 参数: stuNum(int) 学号
// 返回格式: JSON
// 正常代码: 200;
// 错误代码: -1: 内部错误
// 			-10: 教务在线未正常返回或超时
// 			-20: 学号输入错误
// 
//
var jsdom = require('jsdom').jsdom;
//var $ = require('jquery')(require("jsdom").jsdom().parentWindow);
var http = require('http');
var Iconv = require('iconv').Iconv;
var kebiaoModel = require('./model');

var version = '15.05.02';
var defaultTerm = '2014-2015学年2学期';
/**
 * mongodb 缓存时间
 */
var mongodbExpire = 30 * 24 * 3600 * 1000;
/**
 * 每学期修改，开学第一周的星期一的日子，年，月，日，第二个参数0表示一月份。
 * 以便返回当前周数
 */
var TERM_START = new Date(2015, 2, 2); //有坑, 看上面注释

/**
 * 返回当前周，必须配置TERM_START变量
 */
function getNowWeek(callback){
    var w = Math.ceil((new Date() - TERM_START)/(1000*3600*24*7));
    callback && callback(w);
    return w;
}

var infoHash = {
	'200': 'Success',
	'-1': 'Inner Error',
	'-10': 'Jwzx Return Invaild Data',
	'-20': 'Invaild param: stu_num'
};

var hash_day = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"];
var hash_course = ["一二节","三四节","五六节","七八节","九十节","十一二"];

/**
 * 课表获取主函数, 回调型
 * @param  {Number}   xh       [学号]
 * @param  {Function} callback [第一个参数err, 第二个返回JSON]
 */
function kebiaoMain (xh, week, callback) {
	if(!xh)return callback('Wrong XueHao');
	//console.time('req');
	http.get("http://jwzx.cqupt.edu.cn/pubStuKebiao.php?xh=" + xh, function (res){
		
	    
	    var resultData = [];
		var buffers = [], size = 0;
		res.on('data', function (chunk) {
			buffers.push(chunk);
			size += chunk.length;
		})
	
		res.on('end', function () {
			if(res.statusCode != 200) {
                responseData(-10, function (err, re) {
                    return callback && callback(null, re);
                });
            }

			var buffer = Buffer.concat(buffers, size);
			var gbk_to_utf8_iconv = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
	        var utf8_buffer = gbk_to_utf8_iconv.convert(buffer);
	        var doc = utf8_buffer.toString().replace(/&nbsp;/g, '');

            var document = jsdom(doc);
            var window = document.parentWindow;
            var $ = require('jquery')(window);

	        var stuKebiao = [[],[],[],[],[],[],[]];
	        var tbs = $('table');
	        var term; //学期
	        try{
	        	term = $(doc)['5']._childNodes['0'].__nodeValue.match(/\[(.*)\]/)[1] || defaultTerm;
	        }catch(e){
	        	term = defaultTerm;
	        }

	        /* tbNormal 是普通课表 */
	        var tbNormal = $(tbs[0]);
	        tbNormal.find('tr').each(function (ntr, _tr) {
	        	if(ntr == 0) return;
	        	$(this).find('td').each(function (ntd, _td) {
	        		if(ntd == 0) return;
                    var item_element = $(this).html().split(/<font color=\"336699\">([\w\u4e00-\u9fa5]*)<\/font><br>/g);
	        		stuKebiao[ntd - 1].push(item_element);
	        	});
	        });

	        try{
	        	for(var day = 0; day <= 6; day ++) {
                    for (var course = 0; course <= 5; course++) {
                        var cache;
                        //console.log(stuKebiao[day][course]);
                        stuKebiao[day][course].forEach(function (self, n){
                            if(n % 2){
                                cache.period = judgePeriod(self);
                                return resultData.push(cache);
                            }
                            var c = self.toString().split(/<\w*>/g);
                            if (!c[1]) return;
                            var w = parseWeek(c[5]);
                            var d = {
                                hash_day: day,
                                hash_lesson: course,
                                begin_lesson: 2 * course + 1,
                                day: hash_day[day],
                                lesson: hash_course[course],
                                course: c[1],
                                teacher: c[2] && c[2].trim(),
                                classroom: c[3],
                                rawWeek: c[5],
                                weekModel: w.weekModel || 'all',
                                weekBegin: w.weekBegin || 1,
                                weekEnd: w.weekEnd || 17,
                                week: w.week || [],
                                type: $(c[3])['0'] && $(c[4])['0']._childNodes['0'] && $(c[4])['0']._childNodes['0'].__nodeValue,
                                status: c[6] && c[6].split('选课状态:')[1]
                            }
                            cache = d;
                        });
                    }
                }
	        }catch(e){
                console.log('Parse error: ', e);
	        	responseData(-10, function (err, re) {
	        		return callback && callback(null, re);
	        	});
	        }
	        responseData(200, xh, term, weekFilter(week, resultData), function (err, re) {
	        	callback && callback(null, re);
	        });
		});
	});
}

function judgePeriod(str){
    if(str == '连上三节') return 3;
    if(str == '连上四节') return 4;
    return 2;
}

/**
 * 工具函数, 用来解析周数, 默认行课周1 - 18周
 * @param  {String} str [eg. '1-17周单周']
 * @return {Array}     [返回一个数组, 里面包含了上课的周数]
 */
function parseWeek (str) {
    if(!str || typeof str != 'string')return;
    var model, begin, end, t, week = [];
    if(str.match(',')){
        var strArr = str.split(',');
        var resultArr = [], _w = [];
        for(var i = 0, len =  strArr.length; i < len; i++){
            var _p = parseWeek(strArr[i]);
            resultArr[i] = _p;
            _w = _w.concat(_p.week);
        }

        resultArr[0].week = _w;
        resultArr[0].weekEnd = _w[_w.length];

        return resultArr[0];
    }

    t = str.split('-');
    begin = parseInt(t[0]);
    end = parseInt(t[1]);

    if(begin && !end && !str.match('起')) return {
        week: [begin],
        weekModel: 'all',
        weekBegin: begin,
        weekEnd: begin
    };

    begin = begin || 1;
    end = end || 18;
    if(str.indexOf('双周') >= 0){
        model = 'double';
        begin = begin % 2 == 0 ? begin : begin + 1;
        for(var i = begin; i <= end; i += 2)
            week.push(i);
    }else if(str.indexOf('单周') >= 0){
        model = 'single';
        begin = begin % 2 == 1 ? begin : begin + 1;
        for(var i = begin; i <= end; i += 2)
            week.push(i);
    }else{
        model = 'all';
        for(var i = begin; i <= end; i ++)
            week.push(i);
    }
    return {
        week: week,
        weekModel: model,
        weekBegin: begin,
        weekEnd: end
    };
}

function weekFilter(week, arr){
    week = parseInt(week) || 0;
    return arr.filter(function (item) {
        if(week == 0) return true;
        return item.week.indexOf(week) > -1;
    });

}



function responseData (status, xh, term, data, callback) {
	if(typeof xh == 'function') callback = xh;
	var re = {};
	re.status = status || -1;
	re.info = infoHash[status];
	if(re.status == 200){
		re.term = term || defaultTerm;
		re.stuNum = xh;
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
function kebiao (req, res) {
    //var ip = req.ip;
	res.setHeader('Access-Control-Allow-Origin', '*');
	var xh = req.body['stu_num'] || req.body['stuNum'],
        week = parseInt(req.body['week']) || 0;
	if(!xh || parseInt(xh) != xh) {	//NaN or parseInt截断的情况
		responseData(-20, function (err, re) {
			if(err)return console.log(err);
            re.nowWeek = getNowWeek();
			return res.json(re);
		});
	}else
    kebiaoModel.findOne({stuNum: xh}, null, {sort: [{'outOfDateTimestamp': -1}]}, function(err, kbInDb){
        if(err){
            console.log('Kebiao err in getting db form mongo, ', xh, err);
            return responseData(-1, function (err, re) {
                if(err)return console.log(err);
                re.nowWeek = getNowWeek();
                return res.json(re);
            });
        }
        if(!kbInDb || kbInDb.outOfDateTimestamp < new Date().getTime()){
            return kebiaoMain(xh, week, function (err, data) {
                if(err)return console.log(err);
                //Mongodb STORAGE
                (function(data){
                    if(!data.data || data.data.length == 0) return;
                    var options = {expire: mongodbExpire};
                    data.cachedTimestamp = new Date().getTime();
                    data.outOfDateTimestamp = data.cachedTimestamp + options.expire;
                    var k = new kebiaoModel(data)
                    k.save(function(err){
                        if(err) return console.log(err);
                        console.log('Saved in mongodb', data.stuNum);
                    });
                })(data);
                //End storage
                data.nowWeek = getNowWeek();
                return res.json(data);
            });
        }else{
            kbInDb = kbInDb.toObject();
            //filter week
            if(week) {
                var tmpData = [];
                kbInDb.data.forEach(function (i) {
                    if (i.week.indexOf(week) > -1)return tmpData.push(i);
                });
                kbInDb.data = tmpData;
            }
            kbInDb.nowWeek = getNowWeek();
            return res.json(kbInDb);

        }
    });

}

kebiao.type = 'post';
kebiao.rawCall = kebiaoMain;
module.exports = kebiao;
