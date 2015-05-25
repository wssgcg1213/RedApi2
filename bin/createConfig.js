/**
 * Created by andycall on 15/5/4.
 */

module.exports = function(callback){
    var readline = require('readline');
    var fs = require('fs');
    var path = require("path");
    var rootDirectory = process.cwd();
    var pretty = require('jsonpretty');

    var rl = readline.createInterface({
        input : process.stdin,
        output : process.stdout
    });


    rl.question('What is your server listening port(3000) ? \n', function(port) {
        port = port || 3000;

        rl.question('what is your mongoDB path? (mongodb://redapi2)', function(dbPath){

            dbPath = dbPath || 'mongodb://redapi2';

            rl.question('what is the expire data of redis server(240)', function(time) {

                time = time || 240;
                rl.question("which plugins do you want to use?(Example: kebiao jwNewsList)", function(plugins){

                    plugins = plugins || "kebiao jwNewsList";

                    rl.question("where is your root path? (eg: '/redapi2', default to '')", function(root){
                        var config = {
                            listen : port,
                            dsn : dbPath,
                            expire : time,
                            availablePlugins : plugins.split(' '),
                            root: root || ''
                        };

                        fs.writeFileSync(path.join(rootDirectory, 'config.json'), pretty(config));

                        console.log("config.json has been prepared.\n");
                        console.log(pretty(config));

                        rl.close();
                        callback();
                    });
                });
            });
        });
    });
};

