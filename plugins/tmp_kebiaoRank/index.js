/**
 * Created by Liuchenling on 9/11/14.
 */
var rankDb = require('./rank.json');

function main(xh, callback){
    xh = xh.toString();
    var d = rankDb[xh];
    if(!d)return callback('not found');
    return callback(null, {
        stuNum: xh,
        beat: d.beat,
        ranking: d.ranking,
        classSum: d.sum
    });
}

var successData = {
    status: 200,
    info: 'success',

};
var errorData = {
    status: -10,
    info: 'error'
};

function kebiaoRank(req, res){
    res.setHeader('Content-Type','application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    var xh = parseInt(req.body['stuNum']);
    if(!xh) return res.end(JSON.stringify(errorData));
    main(xh, function(err, data){
        if(err){
            console.log(err);
            return res.end(JSON.stringify(errorData));
        }else {
            successData.data = data;
            return res.end(JSON.stringify(successData));
        }
    });
}

kebiaoRank.type = 'post';
module.exports = kebiaoRank;