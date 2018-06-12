const request = require('request');

const baseupServ = require('./baseup.service');
const facebookConst = require('../settings/facebook.constants');

module.exports = {
   sendLogin: sendLogin,
   callSendAPI: callSendAPI,
   sendTypingOn: sendTypingOn,
   sendPartners: sendPartners,
   sendTypingOff: sendTypingOff,
   sendReadReceipt: sendReadReceipt,
   sendWelcomeMessage: sendWelcomeMessage,
   sendMainQuickReply: sendMainQuickReply
};

function sendWelcomeMessage(recipientId) {
   sendTypingOn(recipientId);
   const messageData = {
      recipient: {
         id: recipientId
      },
      message: {
         text: `WELCOME! I'm BotBot, BaseUp 's automated assistant. I'm here to help. For your concerns, choose a button below:`,
         quick_replies: [{
               content_type: 'text',
               title: 'General Inquiries',
               payload: 'GENERAL_INQUIRIES'
            },
            {
               content_type: 'text',
               title: 'Check Partners',
               payload: 'CHECK_PARTNERS'
            },
            {
               content_type: 'text',
               title: 'Other Concerns',
               payload: 'OTHER_CONCERNS'
            }
         ]
      }
   };

   callSendAPI(messageData);
   setTimeout(() => {
      sendTypingOff(recipientId);
      sendReadReceipt(recipientId);
   }, 2000);
}

function sendLogin(recipientId) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then(fullName => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            attachment: {
               type: 'template',
               payload: {
                  template_type: 'button',
                  text: `Hi. ${fullName}, please login to your Base Up Account to continue the subscription.`,
                  buttons: [{
                     type: 'account_link',
                     url: 'https://testing.baseup.me/messenger-login'
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

function sendPartners(recipientId) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then(fullName => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            attachment: {
               type: 'template',
               payload: {
                  template_type: 'generic',
                  elements: [{
                     title: 'Felipe and Sons!',
                     subtitle: 'Barberdashery',
                     image_url: 'https://testing.baseup.me/assets/img/home/partners_messenger/felipe.png',
                     default_action: {
                        type: 'web_url',
                        url: 'http://felipeandsons.com/',
                        messenger_extensions: false,
                        webview_height_ratio: 'full',
                     },
                     buttons: [{
                        type: 'web_url',
                        url: 'http://felipeandsons.com/',
                        title: 'View Website'
                     }, {
                        type: 'postback',
                        title: 'Check Branch',
                        payload: 'FELIPEANDSONS'
                     }]
                  }, {
                     title: 'TUF',
                     image_url: 'https://testing.baseup.me/assets/img/home/partners_messenger/tuf.png',
                     default_action: {
                        type: 'web_url',
                        url: 'http://tufbarbershop.ph/',
                        messenger_extensions: false,
                        webview_height_ratio: 'full',
                     },
                     buttons: [{
                        type: 'web_url',
                        url: 'http://tufbarbershop.ph/',
                        title: 'View Website'
                     }, {
                        type: 'postback',
                        title: 'Check Branch',
                        payload: 'TUF'
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

function sendMainQuickReply(recipientId) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then(fullName => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            text: `Hi. ${fullName} I'm BotBot, BaseUp 's automated assistant. I'm here to help. For your concerns, choose a button below:`,
            quick_replies: [{
                  content_type: 'text',
                  title: 'General Inquiries',
                  payload: 'GENERAL_INQUIRIES'
               },
               {
                  content_type: 'text',
                  title: 'Check Partners',
                  payload: 'CHECK_PARTNERS'
               },
               {
                  content_type: 'text',
                  title: 'Other Concerns',
                  payload: 'OTHER_CONCERNS'
               }
            ]
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
      if (!error && response.statusCode == 200) {
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
   const messageData = {
      recipient: {
         id: recipientId
      },
      sender_action: 'mark_seen'
   };

   callSendAPI(messageData);
}

function sendTypingOn(recipientId) {
   const messageData = {
      recipient: {
         id: recipientId
      },
      sender_action: 'typing_on'
   };

   callSendAPI(messageData);
}

function sendTypingOff(recipientId) {
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