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

app.post('/', express.json(), function (request, response) {
    
    const agent = new WebhookClient({ request, response });
    console.info(`agent set`);
    
    function howManyDevices(agent) {

    }
    
    function howManyInstances(agent) {

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

    function lightOnOffDelayed(agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {

                var location = agent.parameters['ezex_location'];
                var object_name = agent.parameters['ezex_light_object_name'];
                var action = agent.parameters['lightOnorOff'];
                var time = agent.parameters['number-integer'];
                console.log(time);

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

    function thermoControl(agent) {

    }

    function windControl(agent) {

    }

    function tempControl(agent) {

    }

    function tempAndHum(agent) {

    }

    function meterState(agent) {

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
    intentMap.set('lightOnOffDelayed', lightOnOffDelayed);
    intentMap.set('thermoControl', thermoControl);
    intentMap.set('windControl', windControl);
    intentMap.set('tempControl', tempControl);
    intentMap.set('tempAndHum', tempAndHum);
    intentMap.set('meterState', meterState);

    agent.handleRequest(intentMap);
});

app.listen(8080, function () {
    console.info(`Webhook listening on port 8080!`)
});
