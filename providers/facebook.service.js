const _ = require('lodash');
const request = require('request');

const baseupServ = require('./baseup.service');
const facebookConst = require('../settings/facebook.constants');

const mainQR = [{
   content_type: 'text',
   title: 'Make an appointment',
   payload: 'MAKE_APPOINTMENT'
}, {
   content_type: 'text',
   title: 'Check BaseUp partners',
   payload: 'CHECK_PARTNERS'
}, {
   content_type: 'text',
   title: 'Need inspiration?',
   payload: 'NEED_INSPIRATION'
}, {
   content_type: 'text',
   title: 'Link BaseUp account',
   payload: 'SUBSCRIBE'
}, {
   content_type: 'text',
   title: 'Other concerns',
   payload: 'OTHER_CONCERNS'
}];

const inpirationQR = [{
   content_type: 'text',
   title: 'More Inspiration?',
   payload: 'MORE_INSPIRATION'
}, {
   content_type: 'text',
   title: 'I\'\m good for now!',
   payload: 'DONE'
}];

const startOverQR = [{
   content_type: 'text',
   title: 'Start Over',
   payload: 'START_OVER'
}];

module.exports = {
   sendLogin: sendLogin,
   sendBranch: sendBranch,
   sendMessage: sendMessage,
   callSendAPI: callSendAPI,
   sendTypingOn: sendTypingOn,
   sendPartners: sendPartners,
   sendTypingOff: sendTypingOff,
   sendNoFeature: sendNoFeature,
   sendReadReceipt: sendReadReceipt,
   sendDefaultMessage: sendDefaultMessage,
   sendMainQuickReply: sendMainQuickReply,
   notifyHumanOperators: notifyHumanOperators
};

function sendBranch(recipientId, elements) {
   return new Promise((resolve) => {
      sendTypingOn(recipientId);
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            attachment: {
               type: 'template',
               payload: {
                  template_type: 'list',
                  top_element_style: 'compact',
                  elements
               }
            },
            quick_replies: startOverQR
         }
      };

      callSendAPI(messageData).then(() => {
         resolve(true);
         setTimeout(() => {
            sendTypingOff(recipientId);
            sendReadReceipt(recipientId);
         }, 2000);
      });
   });
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
                  text: `Hi ${fullName}, You can now link your BaseUp account to get appointment notifications on Messenger. Login to your BaseUp account to activate.`,
                  buttons: [{
                     type: 'account_link',
                     url: 'https://staging.baseup.me/messenger-login'
                  }]
               }
            },
            quick_replies: startOverQR
         }
      };

      callSendAPI(messageData);
      setTimeout(() => {
         sendTypingOff(recipientId);
         sendReadReceipt(recipientId);
      }, 2000);
   });
}

function sendPartners(recipientId, businesses) {
   return new Promise((resolve) => {
      sendTypingOn(recipientId);
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            attachment: {
               type: 'template',
               payload: {
                  template_type: 'generic',
                  elements: businesses
               }
            },
            quick_replies: startOverQR
         }
      };

      callSendAPI(messageData).then(() => {
         setTimeout(() => {
            sendTypingOff(recipientId);
            sendReadReceipt(recipientId);
         }, 2000);
         resolve(true);
      });
   });
}

function sendDefaultMessage(recipientId) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then(fullName => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            text: `What else can i do for you ${fullName}?`,
            quick_replies: mainQR
         }
      };

      callSendAPI(messageData);
      setTimeout(() => {
         sendTypingOff(recipientId);
         sendReadReceipt(recipientId);
      }, 2000);
   });
}

function sendNoFeature(recipientId) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then(fullName => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            text: `${fullName}, This feature is not yet available right now. But it will be available soon! What else can i do for you?`,
            quick_replies: btnWithDone
         }
      };

      callSendAPI(messageData);
      setTimeout(() => {
         sendTypingOff(recipientId);
         sendReadReceipt(recipientId);
      }, 2000);
   });
}

function sendMessage(recipientId, message, quick_replies) {
   return new Promise((resolve) => {
      sendTypingOn(recipientId);
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            text: message
         }
      };

      callSendAPI(messageData).then(() => {
         resolve(true);
         setTimeout(() => {
            sendTypingOff(recipientId);
            sendReadReceipt(recipientId);
         }, 2000);
      });
   });
}

function sendMainQuickReply(recipientId, type) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then((fullName) => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            text: '',
            quick_replies: {}
         }
      };

      messageData.message.text = (type && type === 'welcome') ? `Welcome ${fullName}, Thank you for linking your BaseUp account. I'm Vicky. BaseUp's automated bot. How can I help you today?` : `Hi ${fullName}, I'm Vicky. BaseUp's automated bot. How can I help you today?`;

      messageData.message.quick_replies = (type && type === 'welcome') ? startOverQR : mainQR;

      callSendAPI(messageData);
      setTimeout(() => {
         sendTypingOff(recipientId);
         sendReadReceipt(recipientId);
      }, 2000);
   });
}

function notifyHumanOperators(recipientId, sendId) {
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
         sendMessage(sendId, `${fullName} is tying to reach you at Baseup Page! Reply ASAP!`);
      } else {
         console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
      }
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
   return new Promise((resolve) => {
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
               resolve(true);
            } else {
               resolve(true);
            }
         } else {}
      });
   });
}