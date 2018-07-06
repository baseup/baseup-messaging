/* jshint node: true, devel: true */
'use strict';

const _ = require('lodash');
const cors = require('cors');
const express = require('express');
const request = require('request');
const emoji = require('emoji');
const bodyParser = require('body-parser');
const app = express();

let quoteID = 0;

const baseupServ = require('./providers/baseup.service');
const facebookServ = require('./providers/facebook.service');

const facebookConst = require('./settings/facebook.constants');
const inspirationConst = require('./settings/inspiration.constants');

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
               console.log('MESSAGE: ', webhook_event.message.text);
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
   let random = [];
   let message = '';
   const text = received_message.text;
   const quickreply = received_message.quick_reply;
   const getPSID = /(what\sis\smy\spsid\splease|get\spsid\splease)/gmi;

   if (quickreply) {
      switch (quickreply.payload) {
         case 'CHECK_PARTNERS':
            handleGetPartners(sender_psid, quickreply.payload);
            break;
         case 'MAKE_APPOINTMENT':
            handleGetPartners(sender_psid, quickreply.payload);
            break;
         case 'OTHER_CONCERNS':
            message = 'Someone from our team will get in touch with you shortly. Hold on tight!';
            facebookServ.sendMessage(sender_psid, message).then(() => {
               let count = 0;
               const customerServ = [2080237678700295, 2018533118171338];

               const functionSendConcerns = () => {
                  console.log(customerServ[count]);
                  facebookServ.notifyHumanOperators(sender_psid, customerServ[count]).then(() => {
                     count++;
                     if (count < customerServ.length) {
                        functionSendConcerns();
                     }
                  });
               };

               functionSendConcerns();
            });
            break;
         case 'DONE':
            message = 'Always Happy to serve you. Hope you have a great day!';
            facebookServ.sendMessage(sender_psid, message);
            break;
         case 'SUBSCRIBE':
            facebookServ.sendLogin(sender_psid);
            break;
         case 'START_OVER':
            facebookServ.sendMainQuickReply(sender_psid);
            break;
         case 'NEED_INSPIRATION':
            random = inspirationConst[Math.floor(Math.random() * inspirationConst.length)];
            quoteID = random.id;
            message = random.quote;
            facebookServ.sendMessage(sender_psid, message, 'inpirationQR');
            break;
         case 'MORE_INSPIRATION':
            const sendInpiration = () => {
               random = inspirationConst[Math.floor(Math.random() * inspirationConst.length)];
               if (random.id !== quoteID) {
                  quoteID = random.id;
                  message = random.quote;
                  facebookServ.sendMessage(sender_psid, message, 'inpirationQR');
               } else {
                  sendInpiration();
               }
            };
            sendInpiration();
            break;
         default:
            facebookServ.sendMainQuickReply(sender_psid);
      }
   } else {
      const isEmojiSpan = /<[a-z][\s\S]*>/i.test(emoji.unifiedToHTML(text));
      const ishaircutEmoji = emoji.unifiedToHTML(text).includes('title="haircut"');

      if (text && text === 'what is my psid please') {
         facebookServ.sendMessage(sender_psid, `Your PSID is ${sender_psid}`);
      } else if (text && isEmojiSpan && ishaircutEmoji) {
         handleGetPartners(sender_psid, 'MAKE_APPOINTMENT');
      } else {
         facebookServ.sendMainQuickReply(sender_psid);
      }
   }

}

function handlePostback(sender_psid, received_postback) {
   const title = received_postback.title;
   const payload = received_postback.payload;

   if (title === 'Book Appointment') {
      handleGetBranch(sender_psid, payload, 'Book');
   } else if (title === 'Check Branch') {
      handleGetBranch(sender_psid, payload, 'View Details');
   } else if (title === 'View Details') {
      handleGetBranchDetails(sender_psid, payload);
   } else if (payload === 'GET_STARTED') {
      facebookServ.sendMainQuickReply(sender_psid);
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
            facebookServ.sendMainQuickReply(sender_psid, 'welcome');
         });
      });
   }
}

function handleGetBranchDetails(psid, details) {
   const data = JSON.parse(details);
   const message = `Name: ${data.name} \n Address: ${data.address} \n Phone: ${data.phone} \n Alias: ${data.alias}`;

   facebookServ.sendMessage(psid, message, 'mainQR');
}

function handleGetBranch(psid, payload, type) {
   baseupServ.getBranches(payload.toLowerCase()).then((result) => {
      const replies = [{
         title: result[0].account.name,
         subtitle: `${result[0].account.address}, ${result[0].account.city} ${result[0].account.province}`,
      }];

      for (const val of result) {
         const button = (type === 'Book') ? {
            type: 'web_url',
            title: type,
            url: `https://staging.baseup.me/widget/${val.account.slug}/${val.id}/?messenger=${psid}`
         } : {
            type: 'postback',
            title: type,
            payload: JSON.stringify({
               name: val.name,
               address: val.address,
               phone: val.phone,
               alias: val.alias
            })
         };

         replies.push({
            title: val.alias,
            subtitle: val.address,
            buttons: [button]
         });
      }
      const dividend = (replies.length % 4 === 1) ? 3 : 4;
      const chunk = _.chunk(replies, dividend);
      let chunkCount = 0;

      const functionSendBranch = () => {
         facebookServ.sendBranch(psid, chunk[chunkCount]).then(() => {
            chunkCount++;
            if (chunkCount < chunk.length) {
               functionSendBranch();
            }
         });
      };
      functionSendBranch();

   }).catch((error) => {
      console.log('BRANCH ERROR: ', JSON.stringify(error));
   });
}

function handleGetPartners(psid, payload) {
   baseupServ.getBusinesses().then((result) => {
      const businesses = [];
      const filterActive = result.filter((value) => {
         return value.metadata.launch;
      });

      for (const val of filterActive) {
         const title = (payload === 'MAKE_APPOINTMENT') ? 'Book Appointment' : 'Check Branch';
         const data = {
            title: val.name,
            buttons: [{
               type: 'postback',
               title,
               payload: val.slug
            }]
         };

         if (val.address) {
            data.subtitle = `${val.address}, ${val.city} ${val.province}`;
         }

         if (val.business_logo) {
            data.image_url = val.business_logo;
         }
         businesses.push(data);
      }

      let chunkCount = 0;
      const chunk = _.chunk(businesses, 10);

      const functionSendBusiness = () => {
         facebookServ.sendPartners(psid, chunk[chunkCount]).then(() => {
            chunkCount++;
            if (chunkCount < chunk.length) {
               functionSendBusiness();
            }
         }).catch(() => {
            console.log('Send Partner Error');
         });
      };
      functionSendBusiness();

   }).catch((error) => {
      console.log('BUSINESS ERROR: ', JSON.stringify(error));
   });
}

app.listen(app.get('port'), () => {
   console.log('Node app is running on port', app.get('port'));
});

module.exports = app;