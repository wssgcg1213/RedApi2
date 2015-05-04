/**
 * Created by andycall on 15/5/4.
 */

var staticModel = require('../models').Static;

function getStatic(type, cb){
    if(type !== 'all' && type !== 'redis'){
        type = "plugin-" + type;
    }
    staticModel.findOne({key: type}, function(err, doc){
        if(err)return console.log(err);
        if(doc){
            cb && cb(doc);
        }else{
            var _o = new staticModel({
                key: type,
                today: 0,
                week: 0,
                all: 0
            });
            _o.save(function(err, doc){
                if(err)return console.log(err);
                cb && cb(doc);
            });
        }
    });
}

function incrStatic(type, cb){
    if(type !== 'all' && type !== 'redis'){
        //incrStatic('all'); //给总访问量也加一次 多此一举
        type = "plugin-" + type;
    }
    staticModel.findOneAndUpdate({key: type}, {$inc: {
        today: 1,
        week: 1,
        all: 1
    } }, function(err, doc){
        if(err)return console.log(err);
        if(doc){
            cb && cb(doc);
        }else{
            var _o = new staticModel({
                key: type,
                today: 1,
                week: 1,
                all: 1
            });
            _o.save(function(err, doc){
                if(err)return console.log(err);
                cb && cb(doc);
            });
        }
    });
}

function clearStatic(dayOrWeek, cb){
    if(dayOrWeek === 'day'){
        if((new Date()).getDay() === 1){//monday
            clearStatic('week', cb);
        }
        staticModel.where().update({}, {today: 0}, { multi: true }, function(err, doc){
            if(err)return console.log(err);
            cb && cb(doc);
        });
    }else if(dayOrWeek === 'week'){
        staticModel.where().update({}, {week: 0}, { multi: true }, function(err, doc){
            if(err)return console.log(err);
            cb && cb(doc);
        });
    }
}


;(function(){
    var d = new Date();
    var firstInterval = new Date(d.getFullYear() + ' ' + (d.getMonth()+1) + ' ' + (d.getDate() + 1) +' 00:00:00') - d;
    setTimeout(function(){
        clearStatic('day');
        setInterval(function(){
            clearStatic('day');
        }, 3600 * 24 * 1000);//one day
    }, firstInterval);
})();

exports.getStatic = getStatic;
exports.clearStatic = clearStatic;
exports.incrStatic = incrStatic;
