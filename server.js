'use strict';

// server & dialogflow setting
const {WebhookClient} = require('dialogflow-fulfillment');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const req = require('request');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// mysql setting
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '13.209.234.251',
    user     : 'jong1994',
    password : 'asd159',
    database : 'test'
});

// mongodb setting
var mongo_url = "mongodb://13.209.234.251:27017";
var dbName = "test";
var collectionName = "test";
var MongoClient = require('mongodb').MongoClient

// ejex setting
const config = require("./config.json");
var endpoint = '';
var action = '';
var options = {
    url: `http://${config.url}/rest/control?object=000D6F000C13EE44&endpoint=${endpoint}&action=${action}`,
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
                agent.add(`MySQL로는 ${name}!`);
                resolve();
            });
            connection.end();
        });
    }

    function mongo_message (agent) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongo_url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, db) {

                var dbo = db.db("test");                                            
                dbo.collection("test").find().toArray(function(err,data){ 
                    var name = data[1].name
                    agent.add(`몽고DB로는 ${name}!`);
                    resolve();
                }); 
                db.close();
            });
        });
    }

    function ezex_control (agent) {
        return new Promise((resolve, reject) => {

            endpoint = 2;
            action = 'off';
            var led = `http://${config.url}/rest/control?object=000D6F000C13EE44&endpoint=${endpoint}&action=${action}`;
            options.url = led;

            req.put(options, function (err, res, body) {
                console.log('일단찍음')
                if(err) console.log(err);
                else {
                   console.log(options.url);
                   console.log(body);
                   agent.add('안녕하세요 종현님~');
                   resolve();
                }
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
    intentMap.set('mongo', mongo_message);
    intentMap.set('hihi', ezex_control);
    intentMap.set('sql', mysql_message);

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
