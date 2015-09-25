var net = require('net');

var client = net.connect({port: 9500},
    function() { //'connect' listener
        client.write(JSON.stringify({type:"auth" , appkey : "1f3d368d87a767d9134d99cee392b062"}));
    });

client.on("data"  , function (data){

    console.log(data.toString())
});

/*
setTimeout(function (){
    client.destroy();
    console.log("out")
},5000)

*/


