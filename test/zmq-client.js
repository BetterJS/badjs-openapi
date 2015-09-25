var net = require('net');

var client = net.connect({port: 9500},
    function() { //'connect' listener
        client.write(JSON.stringify({type:"auth" , appkey : "testfuck"}));
    });

client.on("data"  , function (data){


});

setTimeout(function (){
    client.destroy();
    console.log("out")
},5000)



