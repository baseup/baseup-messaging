const request = require('request');

const facebookConst = require('../settings/facebook.constants');

module.exports = {
   sendMainQuickReply: sendMainQuickReply,
};

function sendMainQuickReply(recipientId) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then(fullName => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         //    message: {
         //       text: 'Hi ' + fullName + '. I'm BotBot, BaseUp's automated assistant. I'm here to help. For your concerns, choose a button below:',
         //       quick_replies: [{
         //             content_type: 'text',
         //             title: 'TRACK',
         //             payload: 'TRACK_ORDER_NOW'
         //          },
         //          {
         //             content_type: 'text',
         //             title: 'OTHER',
         //             payload: 'OTHER_CONCERNS'
         //          },
         //          {
         //             content_type: 'text',
         //             title: 'GENERAL INQUIRY',
         //             payload: 'GENERAL_INQUIRY'
         //          }
         //       ]
         //    }
         // message: {
         //    attachment: {
         //       type: 'template',
         //       payload: {
         //          template_type: 'button',
         //          text: 'What do you want to do next?',
         //          buttons: [{
         //             type: 'web_url',
         //             url: 'https://www.messenger.com',
         //             title: 'Visit Messenger'
         //          }, {
         //             type: 'web_url',
         //             url: 'https://www.messenger.com',
         //             title: 'Visit Messenger'
         //          }, {
         //             type: 'web_url',
         //             url: 'https://www.messenger.com',
         //             title: 'Visit Messenger'
         //          }]
         //       }
         //    }
         // }
         message: {
            attachment: {
               type: 'template',
               payload: {
                  template_type: 'generic',
                  elements: [{
                     title: 'Welcome!',
                     subtitle: 'welcome subtitle',
                     image_url: 'https://petersfancybrownhats.com/company_image.png',
                     default_action: {
                        type: 'web_url',
                        url: 'https://www.messenger.com',
                        messenger_extensions: false,
                        webview_height_ratio: 'tall',
                     },
                     buttons: [{
                        type: 'web_url',
                        url: 'https://petersfancybrownhats.com',
                        title: 'View Website'
                     }, {
                        type: 'postback',
                        title: 'Start Chatting',
                        payload: 'DEVELOPER_DEFINED_PAYLOAD'
                     }]
                  }]
               }
            }
         }

      };

      callSendAPI(messageData);
      setTimeout(() => {
         sendTypingOff(recipientId);
         sendReadReceipt(recipientId);
      }, 2000);
   });
}

function getCustomerName(recipientId) {
   return new Promise((resolve, reject) => {
      request({
         uri: 'https://graph.facebook.com/v2.9/' + recipientId,
         qs: {
            access_token: facebookConst.PAGE_ACCESS_TOKEN,
            fields: 'first_name,last_name'
         },
         method: 'GET',
      }, (error, response, body) => {
         if (!error && response.statusCode == 200) {
            const firstName = JSON.parse(body).first_name;
            const lastName = JSON.parse(body).last_name;
            const fullName = (firstName + ' ' + lastName);
            resolve(fullName);
         } else {
            console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
         }
      });
   });
}

function notifyHumanOperators(recipientId) {
   request({
      uri: 'https://graph.facebook.com/v2.9/' + recipientId,
      qs: {
         access_token: facebookConst.PAGE_ACCESS_TOKEN,
         fields: 'first_name,last_name'
      },
      method: 'GET',
   }, (error, response, body) => {
      console.log(body);
      console.log(response.statusCode);
      if (!error && response.statusCode == 200) {
         console.log(body);
         const firstName = JSON.parse(body).first_name;
         const lastName = JSON.parse(body).last_name;
         const fullName = (firstName + ' ' + lastName);
         // firebase.database().ref('agents').once('value', (snapshot) => {
         //    snapshot.forEach((childSnapshot) => {
         //       const currentKey = childSnapshot.key;
         //       sendTextMessage(currentKey, fullName + ' ' + USER_NOTIFICATION_TO_AGENT);
         //    });
         // });
      } else {
         console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
      }
   });
}

function sendReadReceipt(recipientId) {
   console.log('Sending a read receipt to mark message as seen');

   const messageData = {
      recipient: {
         id: recipientId
      },
      sender_action: 'mark_seen'
   };

   callSendAPI(messageData);
}

function sendTypingOn(recipientId) {
   console.log('Turning typing indicator on');

   const messageData = {
      recipient: {
         id: recipientId
      },
      sender_action: 'typing_on'
   };

   callSendAPI(messageData);
}

function sendTypingOff(recipientId) {
   console.log('Turning typing indicator off');

   const messageData = {
      recipient: {
         id: recipientId
      },
      sender_action: 'typing_off'
   };

   callSendAPI(messageData);
}

function callSendAPI(messageData) {
   request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
         access_token: facebookConst.PAGE_ACCESS_TOKEN
      },
      method: 'POST',
      json: messageData

   }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
         const recipientId = body.recipient_id;
         const messageId = body.message_id;

         if (messageId) {
            console.log('Successfully sent message with id %s to recipient %s',
               messageId, recipientId);
         } else {
            console.log('Successfully called Send API for recipient %s',
               recipientId);
         }
      } else {
         console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
      }
   });
}