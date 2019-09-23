'use strict';

const {WebhookClient} = require('dialogflow-fulfillment');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', function(req,res) {
    res.send('hihiss');
    console.log('h9h');
});

app.post('/', function (request, response) {
    const agent = new WebhookClient({ request, response });
    console.info(`agent set`);

    function hihi (agent) {
        agent.add('안녕하세요 존잘님~')
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

app.listen(8080, function () {
    console.info(`Webhook listening on port 8080!`)
});
