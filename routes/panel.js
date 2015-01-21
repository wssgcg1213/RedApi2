/* 控制面板路由 */
var express = require('express');
var router = express.Router();

var debug = require('debug')('aaa');
/* GET panel */
router.get('/*', function(req, res, next){
    if(1==1){
        next();
    }else{
        debug(req.session);
        res.redirect('/login#deny');
    }
});
router.get('/', function(req, res) {
  res.render('index', {
      user: {
          name: "Ling.",
          type: "Web Developer",
          avatar: "avatar5.png",

      },


      plugins: [
          {
              name: "kebiao",
              des: "课表插件"
          }
      ],

      errors: {
          nums: 1100,

      }


  });
});

router.get('/ajax/access', function(req, res){

});

router.get('/ajax/dashboard-boxrefresh-demo.php', function(req, res){
    res.end(require('fs').readFileSync('./views/tpl/panel-dashboard-loadrefresh.tpl'));
});

module.exports = router;
