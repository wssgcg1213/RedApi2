/**
 * Created by Liuchenling on 5/3/15.
 */
Date.prototype.format =function(format) {
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "h+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4- RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length==1? o[k] :
                ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
}

//!function(window, document){
    var socket = io(location.origin, { path : "/redapi2/admin" });

    Vue.filter('datetime', function(ts){
        return new Date(ts).format('yyyy-MM-dd hh:mm:ss');
    });

    var all = new Vue({
        el: "#all",
        data: {}
    });

    var plugins = new Vue({
        el: "#plugins",
        data: {
            plugins: []
        }
    });

    $.ajax('/adminPlugins', {
        method: "POST",
        success: function(docs){
            if(Object.prototype.toString.call(docs) === '[object Array]'){
                plugins.plugins = docs;
            }
        }
    });

    var redis = new Vue({
        el: "#redis",
        data: {}
    });
    socket.on('redis', function(obj){
        redis.$data = obj;
    });

    var realTime = new Vue({
        el: "#realTime",
        data: {
            accessLog: [],
            errorLog: []
        }
    });
    socket.on('accessLogged', function(obj){
        realTime.accessLog.unshift(obj);
    });
    socket.on('errorLogged', function(obj){
        realTime.errorLog.unshift(obj);
    });
    socket.on('logs', function(obj) {
        if(obj && obj.accessLog){
            realTime.accessLog = obj.accessLog;
        }
        if(obj && obj.errorLog){
            realTime.errorLog = obj.errorLog;
        }
    });
    socket.on('all', function(doc) {
        all.$data = doc;
    });
    socket.on('plugin', function(obj){
        var p = obj.key.replace('plugin-', '');
        plugins.plugins.forEach(function(v){
            if(v.plugin == p){
                v.today = obj.today;
                v.week = obj.week;
                v.all = obj.all;
                return;
            }
        });
    });

//}(window, document);