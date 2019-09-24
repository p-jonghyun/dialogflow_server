'use strict';

const {WebhookClient} = require('dialogflow-fulfillment');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const req = require('request');
const config = require("./config.json");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const queryDevices = "http://" + config.url + "/rest/device";

var options = {
    url: queryDevices,
    auth: {
        user: config.username,
        password: config.password,
        sendImmediately: false
    }
}

app.get('/', function(req,res) {
    res.send('hihiss');
    console.log('h9h');
});

app.post('/', express.json(), function (request, response) {
    
    const agent = new WebhookClient({ request, response });
    console.info(`agent set`);
    var led = `http://114.70.21.30/rest/control?object=000D6F000C13EE44&endpoint=2&action=off`;
    options.url = led;

    function hihi (agent) {
        agent.add('안녕하세요 종현님~');

        req.put(options, function (err, res, body) {
            console.log('일단찍음')

            if(err) console.log(err);
            else {
                console.log(res);
               // console.log(body);
            }
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
    intentMap.set('hihi', hihi);

    agent.handleRequest(intentMap);
});

/*
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
  .listen(3000, function () {
    console.log('Example app listening on port 3000! Go to https://localhost:3000/')
})

*/
app.listen(8080, function () {
    console.info(`Webhook listening on port 8080!`)
});
