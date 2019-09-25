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
    
    function howManyInsances(agent) {

    }

    function lightOnOff(agent) {

    }

    function lightOnOffDelayed(agent) {

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
    intentMap.set('howManyInsances', howManyInsances);
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
