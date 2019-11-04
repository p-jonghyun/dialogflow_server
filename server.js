'use strict';

// server & dialogflow setting
const {WebhookClient} = require('dialogflow-fulfillment');
const express = require('express');
const bodyParser = require('body-parser');
const req = require('request');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// mongodb setting
var mongo_url = "mongodb://13.209.234.251:27017";
var dbName = "test";
var collectionName = "test";
var MongoClient = require('mongodb').MongoClient

// ejex setting
const config = require("./config.json");
var options = {
    url: '',
    auth: {
        user: config.username,
        password: config.password,
        sendImmediately: false
    }
}

// XML setting
var he = require('he');
var parser = require('fast-xml-parser');
var option = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false,
    attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
    tagValueProcessor : a => he.decode(a) //default is a=>a
};

app.post('/', express.json(), function (request, response) {
    
    const agent = new WebhookClient({ request, response });
    console.info(`agent set`);
    
    function howManyDevices(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {

                var location = agent.parameters['ezex_location'];
                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                }

                dbo.collection("prototype").distinct("type_name", function(err,data){ 
                    var typelist = '';
                    for(let i=0; i<data.length; i++) {
                        if(i == data.length -1) typelist += data[i]
                        else typelist += ( data[i] + ', ');
                    }
                    agent.add(`${location}에 ${typelist}가 있으며 총 ${data.length}개 있습니다`);
                    resolve();
                }); 
                
                db.close();
            });
        });
    }
    
    
    function howManyInstances(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {

                var location = agent.parameters['ezex_location'];
                var device_type = agent.parameters['ezex_device_type'];

                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                    "type_name" : device_type
                }

                dbo.collection("prototype").distinct("object_name", query, function(err,data){ 
                    var instancelist = '';
                    for(let i=0; i<data.length; i++) {
                        if(i == data.length -1) instancelist += data[i]
                        else instancelist += ( data[i] + ', ');
                    }
                    agent.add(`${location}에 ${device_type}은 ${instancelist}에 있으며 총 ${data.length}개 있습니다`);
                    resolve();
                }); 
                
                db.close();
            });
        });
    }

    function lightOnOff(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {

                var location = agent.parameters['ezex_location'];
                var object_name = agent.parameters['ezex_light_object_name'];
                var action = agent.parameters['lightOnorOff'];

                if (action == '켜줘') action = 'on';
                else action = 'off';

                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                    "object_name" :  object_name
                }
            
                dbo.collection("prototype").find(query).toArray(function(err,data){ 
                    var object_id = data[0].object_id;
                    var endpoint = data[0].endpoint;
                    var led = `http://${config.url}/rest/control?object=${object_id}&endpoint=${endpoint}&action=${action}`;
                    options.url = led;
                    console.log(options);

                    req.put(options, function (err, res, body) {
                        if(err) console.log(err);
                        else console.log(body);

                        if(action == 'on') action = '키';
                        else action = '끄';
                        agent.add(`${location}에 ${object_name} 불을 ${action}겠습니다`)
                        resolve();
                    });
                }); 
                db.close();
            });
        });
    }

    function autoLightOff(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {

                var location = agent.parameters['ezex_location'];
                var object_name = agent.parameters['ezex_light_object_name'];
                var time = agent.parameters['number'];
                var measure = agent.parameters['timeMeasure'];
                
                var calctime = time;
                if(measure=='분') calctime *= 60;
                else if(measure == '시간') calctime *= 3600;
                calctime *= 10;

                console.log(calctime, measure);

                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                    "object_name" :  object_name
                }

                dbo.collection("prototype").find(query).toArray(function(err,data){ 
                    var object_id = data[0].object_id;
                    var endpoint = data[0].endpoint;
                    var led = `http://${config.url}/rest/attribute?object=${object_id}&endpoint=${endpoint}&name=ontime&value=${time}`;
                    options.url = led;
                    console.log(options);

                    req.put(options, function (err, res, body) {
                        if(err) console.log(err);
                        else console.log(body);

                        agent.add(`${location}에 ${object_name} 전등의 자동소등을 ${time}${measure} 뒤에 하겠습니다`)
                        resolve();
                    });
                }); 
                db.close();
            });
        });
    }

    function thermoControl(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {
                var location = agent.parameters['ezex_location'];
                var thermode = agent.parameters['ezex_thermostat_function'];
                var tempmode = '';
                if(location.length == 0 || thermode.length == 0) {
                    //agent.add(`다시 말해줘요.`);
                    //resolve();
                }

                switch(thermode) {
                    case "정지":
                        tempmode = 'off';
                        break;
                    case "운전":
                        tempmode = 'on';
                        break;
                    case "자동":
                        tempmode = 'auto';
                        break;
                    case "난방":
                        tempmode = 'heat';
                        break;
                    case "송풍":
                        tempmode = 'fan';
                        break;
                    case "제습":
                        tempmode = 'dry';
                        break;
                    default:
                        // agent.add(`없는 기능이에요. 다시 말씀해주세요`);
                        //resolve();
                }
                
                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                    "type" : "thermostat"
                }

                dbo.collection("prototype").find(query).toArray(function(err,data){ 
                    var object_id = data[0].object_id;
                    var endpoint = data[0].endpoint;
                    var led = `http://${config.url}/rest/aircon?object=${object_id}&endpoint=${endpoint}&mode=${tempmode}`;
                    options.url = led;
                    console.log(`${location}에 냉난방기 동작모드를 ${thermode}으로 변경 하였습니다`)
                    console.log(options);
                    
                    req.put(options, function (err, res, body) {
                        if(err) console.log(err);
                        else console.log(body);

                        agent.add(`${location}에 냉난방기 동작모드를 ${thermode}으로 변경 하였습니다`)
                        resolve();
                    });
                }); 
                db.close();
            });
        });
    }

    function windControl(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {
                var location = agent.parameters['ezex_location'];
                var windlevel = agent.parameters['ezex_thermostat_level'];
                var templevel = '';
                //if(location.length == 0 || thermode.length == 0) {
                    //agent.add(`다시 말해줘요.`);
                    //resolve();
                //}

                switch(windlevel) {
                    case "약풍":
                        templevel = 'low';
                        break;
                    case "중풍":
                        templevel = 'medium';
                        break;
                    case "강풍":
                        templevel = 'high';
                        break;
                    case "자동":
                        templevel = 'auto';
                        break;
                    default:
                        // agent.add(`없는 기능이에요. 다시 말씀해주세요`);
                        //resolve();
                }
                
                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                    "type" : "thermostat"
                }

                dbo.collection("prototype").find(query).toArray(function(err,data){ 
                    var object_id = data[0].object_id;
                    var endpoint = data[0].endpoint;
                    var led = `http://${config.url}/rest/aircon?object=${object_id}&endpoint=${endpoint}&fan=${templevel}`;
                    options.url = led;
                    console.log(options);

                    req.put(options, function (err, res, body) {
                        if(err) console.log(err);
                        else console.log(body);

                        agent.add(`${location}에 바람세기를 ${windlevel}으로 변경 하였습니다`)
                        resolve();
                    });
                }); 
                db.close();
            });
        });
    }

    function tempControl(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {
                var location = agent.parameters['ezex_location'];
                var temperature = agent.parameters['number'];
                var templevel = '';
                
                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                    "type" : "thermostat"
                }

                dbo.collection("prototype").find(query).toArray(function(err,data){ 
                    var object_id = data[0].object_id;
                    var endpoint = data[0].endpoint;
                    var led = `http://${config.url}/rest/aircon?object=${object_id}&endpoint=${endpoint}&setpoint=${temperature}`;
                    options.url = led;
                    console.log(options);

                    req.put(options, function (err, res, body) {
                        if(err) console.log(err);
                        else console.log(body);

                        agent.add(`${location}에 온도를 ${temperature}도로 변경 하였습니다`)
                        resolve();
                    });
                }); 
                db.close();
            });
        });
    }

    function tempAndHum(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {
                var location = agent.parameters['ezex_location'];
                var tempeOrHum = agent.parameters['tempOrHum'];
                
                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                    "type" : "thermostat"
                }
                
                dbo.collection("prototype").find(query).toArray(function(err,data){ 
                    var object_id = data[0].object_id;
                    var endpoint = data[0].endpoint;
                    var led = `http://${config.url}/rest/aircon?object=${object_id}&endpoint=${endpoint}&setpoint=${temperature}`;
                    options.url = led;
                    console.log(options);

                    req.put(options, function (err, res, body) {
                        if(err) console.log(err);
                        else console.log(body);

                        agent.add(`${location}에 온도를 ${temperature}도로 변경 하였습니다`)
                        resolve();
                    });
                }); 
                db.close();
            });
        });
    }

    function meterState(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {
                var location = agent.parameters['ezex_location'];
                var object_name = agent.parameters['ezex_meter_objectname'];
                var state = agent.parameters['ezex_meter_state'];

                var dbo = db.db("dialogflow"); 
                const query = {
                    "location" : location,
                    "object_name" : object_name
                }

                dbo.collection("prototype").find(query).toArray(function(err,data){ 
                    console.log(data);
                    var object_id = data[0].object_id;
                    var endpoint = data[0].endpoint;
                    var led = `http://${config.url}/rest/power?object=${object_id}&endpoint=${endpoint}`;
                    options.url = led;
                    console.log(options);

                    req.get(options, function (err, res, body) {
                        if(err) console.log(err);
                        else console.log(body);
                        var tObj = parser.getTraversalObj(body,option);
                        var jsonObj = parser.convertToJson(tObj,option);
                        var tempstate = '';

                        switch(state) {
                            case "누적전력":
                                tempstate = jsonObj.power.energy + 'Wh';
                                break;
                            case "순시전력":
                                tempstate = jsonObj.power.power + 'W';
                                break;
                            case "전압":
                                tempstate  = jsonObj.power.voltage + 'V';
                                break;
                            case "전류":
                                tempstate = jsonObj.power.current + 'A';
                                break;
                            default:
                               
                        }


                        agent.add(`${location}에 ${object_name}의 현재 ${state}는 ${tempstate}입니다`)
                        resolve();
                    });
                }); 
                db.close();
            });
        });
    }

    function welcome (agent) {
        agent.add(`Welcome to Express.JS webhook!`);
    }
    
    function fallback (agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('howManyDevices', howManyDevices);
    intentMap.set('howManyInstances', howManyInstances);
    intentMap.set('lightOnOff', lightOnOff);
    intentMap.set('autoLightOff', autoLightOff);
    intentMap.set('thermoControl', thermoControl);
    intentMap.set('windControl', windControl);
    intentMap.set('tempControl', tempControl);
    intentMap.set('tempAndHum', tempAndHum);
    intentMap.set('meterState', meterState);

    agent.handleRequest(intentMap);
});

app.get('/', function(request, response) {
    console.log('hihi');
});

app.listen(8080, function () {
    console.info(`Webhook listening on port 8080!`)
});


