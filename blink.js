

"use strict";
var http = require('http');//.Server(app);
var url = require('url');
var fs = require('fs');
var path = require('path');
var fuzzy = require('./fuzzy.js');
    
var v;//fuzzy
var connInfo;//伺服器連線設定
var GainIn=[1,1,1,1,1,1,1,1];
var GainOut=[1,1,1,1];
var FUO=0;
//set iot2040 pinout
const iot2040setup = true;
//if(iot2040setup){
    const mraa = require('mraa'); 
    let myLed = new mraa.Gpio(0); 
    //let myLed = new mraa.Gpio(13);
    myLed.dir(mraa.DIR_OUT);
    myLed.write(1);
    let ledState = true; 
    var count = 0;
    function periodicActivity() {
        //myLed.write(ledState ? 1 : 0); 
        //ledState = !ledState;
        var l = Math.round(FUO);
        if(count > 0){
            count--;
            myLed.write(0);
            
            console.log("o",count);
        }else{
            count=l;
            myLed.write(1);
            console.log("x",count);
        }
    }    
    //setInterval(periodicActivity, 2000); 
//}

function getConf(){
    fs.readFile('./conf.json', 'utf8', function (err, data) {
        if (err) throw err;
        connInfo = JSON.parse(data);
        console.log(connInfo);
    });
}
getConf();

var server = http.createServer(function(req,res) {
    var auth = req.headers['authorization'];  
    if(!auth) {     
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        res.end('Not found');
    }
    else if(auth) {    
        var tmp = auth.split(' ');   
        var buf = new Buffer(tmp[1], 'base64'); 
        var plain_auth = buf.toString();
        var creds = plain_auth.split(':');     
        var username = creds[0];
        var password = creds[1];
        
        if((username == connInfo.user) && (password == connInfo.password)) { 
            //res.statusCode = 200;  // OK
            //res.end('');
            var action = url.parse(req.url).pathname;
            var query = url.parse(req.url).query;
            if(action == "/FzgetInit"){//得到初始Fuzzy結構
                var s = v.getInit();
                res.end(s);
            }else if(action == "/FzStart"){//計算fuzzy結果
                var store="";
                req.on('data',function(data){
                    store += data;
                })
                req.on('end',function(data){
                    var s = JSON.parse(store);
                    //console.log(s);
                    var n = v.getInNum();
                    if(s.data.length == n){ 
                        var p0 = s.data[0] * GainIn[0];
                        var p1 = s.data[1] * GainIn[1];
                        v.fuzzify([p0,p1]);
                        v.evaluate();
                        FUO=v.defuzzify() * GainOut[0];
                        if(iot2040setup)
                            periodicActivity();
                        var str = JSON.stringify(FUO, null, 4);
                        res.end(str);   
                    }else{
                        res.end(`Input num is ${n}`);
                    }
                })
            }else if(action == "/FzStop"){
                var store="";
                req.on('data',function(data){
                    store += data;
                })
                req.on('end',function(data){
                    //var s = JSON.parse(store);
                    if(iot2040setup)
                        myLed.write(1);
                });
            }else if(action == "/FzSetG"){//set conf資料
                var store="";
                req.on('data',function(data){
                    store += data;
                })
                req.on('end',function(data){
                    var s = JSON.parse(store);

                    console.log("get fzg");
                    GainIn=s.gin;
                    GainOut=s.gou;
                    console.log(GainIn,GainOut);
                })
            }else if(action == "/FzSet"){//set conf資料
                var store="";
                req.on('data',function(data){
                    store += data;
                })
                req.on('end',function(data){
                    var s = JSON.parse(store);
                    console.log("get fz");
                    v.setInit(s.fz);
                    var str = JSON.stringify(s.fz, null, 4);
                    fs.writeFile("test1.json", str, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                    });
                })
            }else if(action == "/getConf"){//get conf資料
                getConf();
                var s = JSON.stringify(connInfo, null, 4);
                res.end(s);
            }else if(action == "/setConf"){//set conf資料
                var store="";
                req.on('data',function(data){
                    store += data;
                })
                req.on('end',function(data){
                    var s = JSON.parse(store);
                    console.log(s);
                    s = JSON.stringify(s, null, 4);
                    fs.writeFile("conf.json", s, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                    });
                })
            }else{
                var pathname = __dirname + '/app' + action;
                const mimeType = {
                    '.ico': 'image/x-icon',
                    '.html': 'text/html',
                    '.js': 'text/javascript',
                    '.json': 'application/json',
                    '.css': 'text/css',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.wav': 'audio/wav',
                    '.mp3': 'audio/mpeg',
                    '.svg': 'image/svg+xml',
                    '.pdf': 'application/pdf',
                    '.doc': 'application/msword',
                    '.eot': 'appliaction/vnd.ms-fontobject',
                    '.ttf': 'aplication/font-sfnt'
                  };
                fs.exists(pathname, function (exist) {
                    if(!exist) {
                        // if the file is not found, return 404
                        res.statusCode = 404;
                        res.end("");//`File ${pathname} not found!`);
                        return;
                    }
                    // if is a directory, then look for index.html
                    if (fs.statSync(pathname).isDirectory()) {
                        pathname += '/index.html';
                    }
                    // read file from file system
                    fs.readFile(pathname, function(err, data){
                        if(err){
                            res.statusCode = 500;
                            res.end("");//res.end(`Error getting the file: ${err}.`);
                        } else {
                            // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                            const ext = path.parse(pathname).ext;
                            // if the file is found, set Content-type and send data
                            res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
                            res.end(data);
                        }
                    });
                });
            }
                
        }
        else {
            res.statusCode = 401; 
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
            res.end('Not found');
        }
    }
});
console.log("listen: *3001");
server.listen(3001);

//TSK MODEL
function fuzzy_init(){
    v = new fuzzy.FuzzyLogic;
    if (v.setInput("pm25",3))
    if (v.setInput("temp",3))
    if (v.setOutput("out",3))
    if (v.setTriangle("pm25","good",[0.00,0.00,0.20,0.35]))
    if (v.setTriangle("pm25","soso",[0.30,0.40,0.40,0.50]))
    if (v.setTriangle("pm25","bad" ,[0.50,0.60,1.00,1.00]))
    if (v.setTriangle("temp","warm",[0.00,0.00,0.22,0.27]))
    if (v.setTriangle("temp","soso",[0.20,0.25,0.25,0.30]))
    if (v.setTriangle("temp","hot" ,[0.23,0.28,1.00,1.00]))
    if (v.setSingleton("out","off",[0]))
    if (v.setSingleton("out","lv1",[0.5]))
    if (v.setSingleton("out","lv2",[1]))
    if (v.addRule({IF:["good","warm"],Type:"AND",THEN:["off"]}))
    if (v.addRule({IF:["good","soso"],Type:"AND",THEN:["off"]}))
    if (v.addRule({IF:["good","hot"] ,Type:"AND",THEN:["lv1"]}))
    if (v.addRule({IF:["soso","warm"],Type:"AND",THEN:["off"]}))
    if (v.addRule({IF:["soso","soso"],Type:"AND",THEN:["lv1"]}))
    if (v.addRule({IF:["soso","hot"] ,Type:"AND",THEN:["lv1"]}))
    if (v.addRule({IF:["bad","warm"] ,Type:"AND",THEN:["lv1"]}))
    if (v.addRule({IF:["bad","soso"] ,Type:"AND",THEN:["lv1"]}))
    if (v.addRule({IF:["bad","hot"]  ,Type:"AND",THEN:["lv2"]}))
    fs.writeFile("test.json", v.getInit(), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    v.fuzzify([0.0,0.00]);
    v.evaluate();
    console.log(v.defuzzify());
    /*var a =v.getInit();
    var obj = JSON.parse(a);
    v.setInit(obj);*/
}
fuzzy_init();

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    try{
        myLed.write(1);
    }catch(e){
        
    }
    
    process.exit();
});
