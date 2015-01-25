/**
 * Created by Liuchenling on 11/9/14.
 */
var xwxxNews = require('../xwxxNewsContent/index');
var cyxwNews = require('../cyxwNewsContent/index');
module.exports = M;

function M(req, res){
    res.setHeader('Content-Type','application/json');
    var main;
    var id = req.body['id'].toString();

    if(!id) return res.end(JSON.stringify({
        status: 0,
        info: "Invaild ID"
    }));

    if(id.length > 10){
        main = xwxxNews.main;
    }else{
        main = cyxwNews.main;
    }
    main(id, function (err, data) {
        if(err)return console.log(err);
        res.end(JSON.stringify(data));
    });
}

M.type = 'post';