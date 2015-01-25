/**
 * Created by Liuchenling on 11/9/14.
 */
var cyxwMain = require('../cyxwNewsList/index').main;
var xwxxMain = require('../xwxxNewsList/index').main;

var version = '14.11.9';
var infoHash = {
    '200': 'Success',
    '-1': 'Inner Error',
    '-10': 'Server Return Invaild Data',
    '-20': 'Invaild param: page'
};

function main(page, callback){
    var news = [];
    var _p = Math.ceil(page / 2);  //页数减半
    cyxwMain(1, _p, function(err, data){
        if(err || !data.data) return callback(1);
        if(page % 2) data.data = data.data.slice(0, 5);
        else data.data = data.data.slice(5, 10);
        data.data.forEach(function(item){
            var d = item.date.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            news.push({
                title: item.title,
                id: item.id,
                type: "cyxw",
                timestamp: new Date(d[1], d[2] - 1, d[3]).getTime()
            });
        });

        xwxxMain(_p, function(e, xdata){
            if(e || !xdata.data) return callback(1);
            if(page % 2) xdata.data = xdata.data.slice(0, 5);
            else xdata.data = xdata.data.slice(5, 10);
            xdata.data.forEach(function(ite){
                news.push({
                    title: ite.title,
                    id: ite.id,
                    type: "xwxx",
                    timestamp: new Date(ite.date).getTime()
                });
            });
            callback(null, {
                "status": 200,
                "info": "Success",
                "page": page,
                "data": news
            });
        });

    });
}

function newsList (req, res) {
    res.setHeader('Content-Type','application/json');
    var page = parseInt(req.body['page']) || 1;
    main(page, function (err, data) {
        if(err)return console.log(err);
        res.end(JSON.stringify(data));
    });
}

newsList.type = 'post';
module.exports = newsList;