/* jshint node: true, devel: true */
'use strict';

const _ = require('lodash');
const cors = require('cors');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
let messageReply = '';

const baseupServ = require('./providers/baseup.service');
const facebookServ = require('./providers/facebook.service');

const facebookConst = require('./settings/facebook.constants');

app.use(cors());
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));

app.get('/', (req, res) => {
   res.send('HELLO WORLD');
});

app.get('/webhooks', (req, res) => {
   if (req.query['hub.verify_token'] === facebookConst.VALIDATION_TOKEN) {
      res.status(200).send(req.query['hub.challenge']);
   } else {
      console.error('Failed validation. Make sure the validation tokens match.');
      res.sendStatus(403);
   }
});

app.post('/send-message', (req, res) => {

   const reqBody = req.body;
   const dataString = {
      messaging_type: 'RESPONSE',
      recipient: {
         id: reqBody.psid
      },
      message: {
         text: reqBody.message
      }
   };

   request({
      url: `https://graph.facebook.com/v2.9/me/messages?access_token=${facebookConst.PAGE_ACCESS_TOKEN}`,
      method: 'POST',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataString)
   }, (error, response, body) => {
      if (error) {
         res.status(400).send(error);
      } else if (response.error) {
         res.status(400).send(JSON.parse(body));
      } else {
         res.status(200).send(JSON.parse(body));
      }
      res.end();
   });
});

app.post('/webhooks', (req, res) => {
   const body = req.body;
   if (body.object === 'page') {
      body.entry.forEach((bodyEntry) => {
         bodyEntry.messaging.forEach((webhook_event) => {
            const sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
               handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
               handlePostback(sender_psid, webhook_event.postback);
            } else if (webhook_event.account_linking) {
               handleAccountLinking(sender_psid, webhook_event.account_linking);
            }
         });
      });

      res.status(200).send('EVENT_RECEIVED');
   } else {
      res.sendStatus(404);
   }
});

function handleMessage(sender_psid, received_message) {
   let message = '';
   const text = received_message.text;
   const quickreply = received_message.quick_reply;

   if (quickreply) {
      switch (quickreply.payload) {
         case 'CHECK_PARTNERS':
            facebookServ.sendPartners(sender_psid);
            break;
         case 'MAKE_APPOINTMENT':
            facebookServ.sendPartners(sender_psid);
            break;
         case 'OTHER_CONCERNS':
            message = 'Our Customer Service Supervisor will be talking to you shortly. Please wait a little. Thank you.';
            facebookServ.sendMessage(sender_psid, message);
            break;
         case 'DONE':
            message = 'Always Happy to serve you. Hope you have a great day!';
            facebookServ.sendMessage(sender_psid, message);
            break;
         case 'SUBSCRIBE':
            facebookServ.sendLogin(sender_psid);
            break;
         default:
            facebookServ.sendMainQuickReply(sender_psid);
      }
   } else {
      facebookServ.sendMainQuickReply(sender_psid);
   }
}

function handlePostback(sender_psid, received_postback) {
   const title = received_postback.title;
   const payload = received_postback.payload;

   if (title === 'View Details') {

   } else if (payload === 'GET_STARTED') {
      facebookServ.sendMainQuickReply(sender_psid, 'welcome');
   }
}

function handleAccountLinking(sender_psid, received_account_linking) {
   const status = received_account_linking.status;
   const authCode = received_account_linking.authorization_code;

   if (status === 'linked') {
      baseupServ.getAuthBaseupUser(authCode).then((authResponse) => {
         const metaData = authResponse.metadata;
         const fullname = `${authResponse.first_name}  ${authResponse.last_name}`;
         metaData.psid = sender_psid;

         const attributes = {
            metadata: metaData
         };

         baseupServ.storeUserPSID(authCode, authResponse.id, attributes).then((updateResponse) => {
            facebookServ.sendWelcomeMessage(sender_psid, fullname);
         });
      });
   }
}

function handleGetBranch(psid, payload, type) {
   baseupServ.getBranches(payload.toLowerCase()).then((result) => {
      const replies = [];

      for (const val of result) {
         console.log('VALUE: ', JSON.stringify(val));
         const button = (type === 'Book Appointment') ? {
            type: 'postback',
            title: type,
            payload: val.id
         } : {
            type: 'web_url',
            title: type,
            url: `https://staging.baseup.me/widget/${val.account.slug}/${val.id}/?messenger=${psid}`
         };

         replies.push({
            title: val.alias,
            subtitle: val.address,
            buttons: [button]
         });
      }
      const dividend = (replies.length % 4 === 1) ? 3 : 4;
      let chunkCount = 0;
      const chunk = _.chunk(replies, dividend);

      const functionSendBranch = () => {
         if (chunkCount < chunk.length) {
            facebookServ.sendBranch(psid, chunk[chunkCount]).then(() => {
               chunkCount++;
               functionSendBranch();
            });
         }
      };
      functionSendBranch();

   }).catch((error) => {
      console.log('BRANCH ERROR: ', JSON.stringify(error));
   });
}

app.listen(app.get('port'), () => {
   console.log('Node app is running on port', app.get('port'));
});

module.exports = app;