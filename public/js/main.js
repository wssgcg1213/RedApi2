/**
 * Created by Liuchenling on 5/3/15.
 */
//!function(window, document){
    var socket = io(location.origin, { path : "/admin" });

    Vue.filter('datetime', function(ts){
        return new Date(ts);
    });

    var all = new Vue({
        el: "#all",
        data: {
            today: 1234,
            week: 23423
        }
    });

    var plugins = new Vue({
        el: "#plugins",
        data: {
            plugins: [{
                plugin: 'kebiao',
                today: 2222,
                week: 4444,
                all: 5555
            },{
                plugin: 'another',
                today: 5345,
                week: 34543,
                all: 34543
            }]
        }
    });

    var redis = new Vue({
        el: "#redis",
        data: {
            ttl: 240,
            pool: 1234,
            today: 5345,
            week: 34543,
            all: 34543
        }
    });
    socket.on('redis', function(obj){
        redis.$data = obj;
    });

    var realTime = new Vue({
        el: "#realTime",
        data: {
            accessLog: [{
                ip: "127.0.0.1",
                path: "/api/kebiao",
                plugin: "kebiao",
                requestBody: {stu_num: 2013214368},
                timestamp: 1430642195956
            }],
            errorLog: [{
                ip: "127.0.0.1",
                path: "/api/kebiao",
                plugin: "kebiao",
                requestBody: {stu_num: 2013214368},
                timestamp: 1430642195956,
                message: "Invaild param: stu_num"
            }]
        }
    });
    socket.on('accessLogged', function(obj){
        realTime.accessLog.unshift(obj);
    });
    socket.on('errorLogged', function(obj){
        realTime.errorLog.unshift(obj);
    });
//}(window, document);