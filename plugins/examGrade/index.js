var version = '0.0.2';

function main(xh, pwd, callback) {
    var api_app = 'cyxbs';
    var api_token = 'Q60BCrBDEGsLtdXmTAp1hIPbAg4Aak51pNQQAavydZM=';
    var req = require('http').request({
        host: "hongyan.cqupt.edu.cn",
        path: "/cyxbs/api/exam/grade/" + xh + '?id_num=' + pwd,
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
            if (jsonData.status == 0)
                jsonData.status = 200;
            jsonData.version = version;
            callback && callback(null, jsonData);
        });
    });
    req.end();
}

function grade(req, res) {
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

grade.type = 'post';
module.exports = grade;