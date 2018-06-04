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

app.post('/webhook', (req, res) => {
   const body = req.body;

   if (body.object === 'page') {
      body.entry.forEach((entry) => {

         const webhook_event = entry.messaging[0];
         console.log('Webhook Event: ', webhook_event);

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
   const text = received_message.text;
   const quickreply = received_message.quick_reply;

   if (quickreply) {
      if (quickreply === 'CHECK_PARTNERS') {
         facebookServ.sendPartners(sender_psid);
      }
   } else {
      facebookServ.sendMainQuickReply(sender_psid);
   }
}

function handlePostback(sender_psid, received_postback) {
   let response;

   let payload = received_postback.payload;

   console.log('RECEIVED POSTBACK: ', received_postback);
   // if (payload === 'yes') {
   //    response = {
   //       "text": "Thanks!"
   //    };
   // } else if (payload === 'no') {
   //    response = {
   //       "text": "Oops, try sending another image."
   //    };
   // }
}

app.listen(app.get('port'), () => {
   console.log('Node app is running on port', app.get('port'));
});

module.exports = app;