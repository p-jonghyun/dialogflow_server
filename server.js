'use strict';

const {WebhookClient} = require('dialogflow-fulfillment');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', function(req,res) {
    res.send('hihi');
    console.log('h9h');
});

app.post('/', function (req, res) {
    const agent = new WebhookClient({request: req, response: res});
    console.info(`agent set`);

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('hihi', hihi);
    agent.handleRequest(intentMap);
});

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

app.listen(8080, function () {
    console.info(`Webhook listening on port 8080!`)
});
