var net = require('net');
var zmq = require('zmq');
var _ = require("underscore");
var crypto = require('crypto');

var fs = require('fs');
var connect = require('connect'),
    log4js = require('log4js'),
    logger = log4js.getLogger();


var argv = process.argv.slice();
if(argv.indexOf('--debug') >= 0){
    logger.setLevel('DEBUG');
    GLOBAL.DEBUG = true;
    logger.info('running in debug');

}else {
    logger.setLevel('INFO');
}


var readyClient = [];
var clientMapping = {};
var appKeyList = {};

//var MAX_TIMEOUT = 60*60*1000 * 15;
var MAX_TIMEOUT = 1000 * 15;


acceptor = zmq.socket('pull');


setInterval(function () {

    var now = Date.now();
    var shouldRemove = [];
    readyClient.forEach(function (value) {
        if (now - value.ext.timeout > MAX_TIMEOUT) {
            shouldRemove.push(value);
        }
    })

    shouldRemove.forEach(function (value) {
        value.destroy();
    });

}, MAX_TIMEOUT);


var processProjectId = function (str){
    var map = {};
    (str.split(/[\|_]/) || []).forEach(function (value){
        if(value){
            map[value +""] = true;
        }
    })
    return map;
}

var startService = function () {

    appKeyList = processProjectId(fs.readFileSync("./project.db", "utf-8"));


    connect()
        .use('/getProjects', connect.query())
        .use('/getProjects', connect.bodyParser())
        .use('/getProjects', function (req, res) {

            var param = req.query;
            if (req.method == "POST") {
                 param = req.body;
            }


            if (param.auth != "badjsOpen" || !param.projectsId) {

            } else {

                appKeyList = processProjectId(param.projectsId );

                fs.writeFile("./project.db", param.projectsId , function () {
                    logger.info('update project.db :' + param.projectsId);
                });
            }
            res.writeHead(200);
            res.end();

        })
        .listen(9002);
}


var processClientMessage = function (msg, client) {

    switch (msg.type) {
        case "auth" :
            if (appKeyList.indexOf(msg.appkey) > -1) {
                client.ext.appkey = msg.appkey;
                clientMapping[msg.appkey][client.ext.id] = client;
            }
            break;
        case "keepalive" :
            client.ext.timeout = new Date - 0;
            break;
    }
}


var removeClient = function (client) {
    var index = "flag";
    for (var i = 0; i < readyClient.length; i++) {
        if (readyClient[i].ext.id == client.ext.id) {
            index = i;
            break;
        }
    }

    if (index == "flag") {
        return;
    }

    readyClient.splice(index, 1);

    if (clientMapping[client.ext.appkey]) {
        delete clientMapping[client.ext.appkey][client.ext.id];
    }


}


acceptor.on("message", function (data) {

    try{
        var dataStr = data.toString();
        data = JSON.parse(dataStr.substring(dataStr.indexOf(' ')));
    }catch (e){
        logger.error('parse error');
        return ;
    }

    var regExp = new RegExp(data.id+"\|([^_]+)")
    var match = appKeyList.match(regExp)
    if(!match){
        return ;
    }

    appKeyList.match("dat")

    var appKey = "";
    var message = "";
    var sendingClients = clientMapping[appKey];
    if (sendingClients) {
        _.each(sendingClients, function (value) {
            value.send({type: "message", msg: message});
        })
    }
})


var server  = net.createServer(function (c) { //'connection' listener
    c.ext = {
        id: crypto.createHash("md5").update(new Date - 0 + c.address().address).digest('hex'),
        timeout: new Date - 0,
        appkey: ''
    };

    readyClient.push(c);

    logger.info('client connected , id=' + c.ext.id);

    c.on('data', function (data) {
        var data = JSON.parse(data.toString());
        processClientMessage(data, this);
    });

    c.on('close', function () {
        removeClient(this);
        logger.info("client disconnected , id=" + this.ext.id);
    })

});


startService();

server.listen(9500, function () { //'listening' listener
    logger.info("server start ... ")
});