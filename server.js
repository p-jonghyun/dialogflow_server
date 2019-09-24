'use strict';

const {WebhookClient} = require('dialogflow-fulfillment');
const express = require('express');
var mysql      = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const req = require('request');
const config = require("./config.json");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


var connection = mysql.createConnection({
  host     : '13.209.234.251',
  user     : 'jong1994',
  password : 'asd159',
  database : 'test'
});

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
    
    function mysql_message(agent) {

        return new Promise((resolve, reject) => {
            var name = '';
            connection.connect();

            connection.query('SELECT * FROM student', function (error, results, fields) {
                if (error) {
                    console.log(error);
                }
                name = results[0].sname;
                agent.add(`영어로는 ${name}!`);
                resolve();
            });
            connection.end();
        });
        /*
        var name = '';
        connection.connect();

        connection.query('SELECT * FROM student', function (error, results, fields) {
            if (error) {
                console.log(error);
            }
            name = results[0].sname;
        });

        console.log(name);
        if(name == 'jeff') agent.add(`영어로는 ${name}!`);
        connection.end();
        */
    }

    function ezex_control (agent) {

        var led = `http://114.70.21.30/rest/control?object=000D6F000C13EE44&endpoint=2&action=off`;
        options.url = led;

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
    intentMap.set('ezex', ezex_control);
    intentMap.set('hihi', mysql_message);

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
