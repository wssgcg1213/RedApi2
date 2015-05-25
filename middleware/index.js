/**
 * Created by andycall on 15/5/6.
 */

/**
 * 插件采用黑名单方式，
 * 默认全部加载middleware文件夹内所有的中间价，
 * 跳过黑名单
 * @type {Array}
 */

var fs = require('fs');
var DirectoryRoot = __dirname;
var _ = require('lodash');
var path = require('path'),
    util = require('util'),
    debug = require('debug')('index.js'),
    setupMiddleware;


function deleteFromArray(ele, arr){
    for(var i = 0; i < arr.length; i ++){
        if(arr[i] === ele){
            arr.splice(i, 1);
        }
    }
}

function MiddleWareManager(app){
    this._server = app;
    this.middlewares = [];
    this.blackList = [];
}

MiddleWareManager.prototype.getMiddleWareName = function(src){
    var dirList = fs.readdirSync(src);
    var _this = this;
    _.each(dirList, function(dirname){
        var current = fs.lstatSync(path.join(DirectoryRoot, dirname));
        if(current.isDirectory()) {
            getMiddleWareName(path.join(src, dirname));
        } else if(dirname === 'index.js' || dirname.substring(0,1) === '.') {
            return;
        }
        else {
            _this.middlewares.push(path.join(src, dirname));
        }
    });
};

MiddleWareManager.prototype.loadBlackList = function(){
    var blackList = fs.readFileSync(path.join(DirectoryRoot, '.blackList'), {encoding: "utf-8"}).split('\n');
    this.blackList = blackList;
};

MiddleWareManager.prototype.setup = function(){
    var server = this._server;

    var _this = this;

    // load blackList
    this.loadBlackList();

    // get all middleware
    this.getMiddleWareName(DirectoryRoot);

    var loadList = _.clone(_this.middlewares, true);

    _.each(_this.blackList, function(black){
        deleteFromArray(path.join(DirectoryRoot, [black, '.js'].join('')), _this.middlewares);
    });

    _.each(_this.middlewares, function(middleware){
        console.log("loading middleware: ", middleware);
        var middlewareFile = require(middleware);
        if(middlewareFile.param){
            server.use(middlewareFile.call(server, middlewareFile.param));
        }
        else{
            server.use(middlewareFile);
        }
    });
};

setupMiddleware = function(app){
    var middleware = new MiddleWareManager(app);

    middleware.setup();
};


module.exports = setupMiddleware;














