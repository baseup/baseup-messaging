/* jshint node: true, devel: true */
'use strict';

const Nexmo = require('nexmo');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();

const baseupServ = require('./providers/baseup.service');
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
      res.status(200).send(req.query['hub.challenge']);
   } else {
      console.error('Failed validation. Make sure the validation tokens match.');
      res.sendStatus(403);
   }
});

app.post('/send-message', (req, res) => {
   const reqBody = req.body;
   console.log(reqBody);
   res.send(reqBody);
   // const dataString = {
   //    messaging_type: 'RESPONSE',
   //    recipient: {
   //       id: reqBody.psid
   //    },
   //    message: {
   //       text: 'Your Booking has been Updated!'
   //    }
   // };

   // request({
   //    url: `https://graph.facebook.com/v2.6/me/messages?access_token=${facebookConst.VALIDATION_TOKEN}`,
   //    method: 'POST',
   //    headers: {
   //       'Content-Type': 'application/json'
   //    },
   //    body: dataString
   // }, (error, response, body) => {
   //    if (error) {
   //       res.status(400).send(error);
   //    } else if (response) {
   //       res.status(200).send(body);
   //    }
   // });
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
         } else if (webhook_event.account_linking) {
            handleAccountLinking(sender_psid, webhook_event.account_linking);
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
      if (quickreply.payload === 'CHECK_PARTNERS') {
         facebookServ.sendPartners(sender_psid);
      }
   } else {
      facebookServ.sendMainQuickReply(sender_psid);
   }
}

function handlePostback(sender_psid, received_postback) {
   const title = received_postback.title;
   const payload = received_postback.payload;

   if (title === 'Check Branch') {
      console.log(payload.toLowerCase());
      baseupServ.getBranches(payload.toLowerCase()).then((result) => {
         console.log('BRANCH SUCCESS: ', result);
      }).catch((error) => {
         console.log('BRANCH ERROR: ', error);
      });
   } else if (payload === 'GET_STARTED') {
      facebookServ.sendLogin(sender_psid);
   }
}

function handleAccountLinking(sender_psid, received_account_linking) {
   const status = received_account_linking.status;
   const authCode = received_account_linking.authorization_code;

   if (status === 'linked') {
      baseupServ.getAuthBaseupUser(authCode).then((authResponse) => {
         const metaData = authResponse.metadata;
         const fullname = `${authResponse.first_name}  ${authResponse.first_name}`;
         metaData.psid = sender_psid;

         const attributes = {
            metadata: metaData
         };

         baseupServ.storeUserPSID(authCode, authResponse.id, attributes).then((updateResponse) => {
            console.log('updateResponse: ', updateResponse);
            facebookServ.sendWelcomeMessage(sender_psid, fullname);
         });
      });
   }
}

app.listen(app.get('port'), () => {
   console.log('Node app is running on port', app.get('port'));
});

module.exports = app;