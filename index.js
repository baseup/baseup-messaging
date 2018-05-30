/* jshint node: true, devel: true */
'use strict';

const Nexmo = require('nexmo');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();

const facebookServ = require('./providers/facebook.service');
const facebookConst = require('./settings/facebook.constants');

app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));

app.get('/', (req, res) => {
   res.send('HELLO WORLD');
});

app.get('/webhook', (req, res) => {
   if (req.query['hub.verify_token'] === facebookConst.VALIDATION_TOKEN) {
      console.log("Validating webhook");
      res.status(200).send(req.query['hub.challenge']);
   } else {
      console.error("Failed validation. Make sure the validation tokens match.");
      res.sendStatus(403);
   }
});

app.get('/nexmo', (req, res) => {
   console.log('NEXMO: ', req.body);
});

app.post('/nexmo-outbound', (req, res) => {
   console.log(req.body);
});

app.post('/webhook', (req, res) => {
   const body = req.body;

   if (body.object === 'page') {
      body.entry.forEach((entry) => {

         const webhook_event = entry.messaging[0];
         console.log(webhook_event);

         const sender_psid = webhook_event.sender.id;
         console.log('Sender PSID: ' + sender_psid);

         if (webhook_event.message) {
            handleMessage(sender_psid, webhook_event.message);
         } else if (webhook_event.postback) {
            handlePostback(sender_psid, webhook_event.postback);
         }

      });
      res.status(200).send('EVENT_RECEIVED');
   } else {
      res.sendStatus(404);
   }
});

function handleMessage(sender_psid, received_message) {
   let response;

   if (received_message.text) {
      facebookServ.sendMainQuickReply(sender_psid);
   }
}

function callSendAPI(sender_psid, response) {
   let request_body = {
      "recipient": {
         "id": sender_psid
      },
      "message": response
   };

   request({
      "uri": "https://graph.facebook.com/v2.9/me/messages",
      "qs": {
         "access_token": facebookConst.PAGE_ACCESS_TOKEN
      },
      "method": "POST",
      "json": request_body
   }, (err, res, body) => {
      if (!err) {
         console.log('message sent!');
      } else {
         console.error("Unable to send message:" + err);
      }
   });
}

function handlePostback(sender_psid, received_postback) {
   let response;

   let payload = received_postback.payload;

   if (payload === 'yes') {
      response = {
         "text": "Thanks!"
      };
   } else if (payload === 'no') {
      response = {
         "text": "Oops, try sending another image."
      };
   }
   callSendAPI(sender_psid, response);
}

app.listen(app.get('port'), () => {
   console.log('Node app is running on port', app.get('port'));
});

module.exports = app;