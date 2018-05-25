/* jshint node: true, devel: true */
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));
app.listen(3000, () => console.log("Webhook server is listening, port 3000"));

app.get('/', (req, res) => {
   res.send('HELLO WORLD');
});

app.get('/webhook', function (req, res) {
   if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
      console.log("Validating webhook");
      res.status(200).send(req.query['hub.challenge']);
   } else {
      console.error("Failed validation. Make sure the validation tokens match.");
      res.sendStatus(403);
   }
});

app.listen(app.get('port'), function () {
   console.log('Node app is running on port', app.get('port'));
});

module.exports = app;