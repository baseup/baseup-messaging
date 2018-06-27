const request = require('request');

const baseupServ = require('./baseup.service');
const facebookConst = require('../settings/facebook.constants');

module.exports = {
   sendFAQ: sendFAQ,
   sendLogin: sendLogin,
   sendBranch: sendBranch,
   sendMessage: sendMessage,
   callSendAPI: callSendAPI,
   sendTypingOn: sendTypingOn,
   sendPartners: sendPartners,
   sendTypingOff: sendTypingOff,
   sendNoFeature: sendNoFeature,
   sendReadReceipt: sendReadReceipt,
   sendOtherConcerns: sendOtherConcerns,
   sendDefaultMessage: sendDefaultMessage,
   sendWelcomeMessage: sendWelcomeMessage,
   sendMainQuickReply: sendMainQuickReply
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
            quick_replies: [{
               content_type: 'text',
               title: 'FAQs',
               payload: 'FAQ'
            }, {
               content_type: 'text',
               title: 'Check Partners',
               payload: 'CHECK_PARTNERS'
            }, {
               content_type: 'text',
               title: 'Other Concerns',
               payload: 'OTHER_CONCERNS'
            }, {
               content_type: 'text',
               title: 'I\'\m good for now!',
               payload: 'DONE'
            }]
         }
      };

      callSendAPI(messageData);
      setTimeout(() => {
         sendTypingOff(recipientId);
         sendReadReceipt(recipientId);
      }, 2000);
      resolve(true);
   });
}

function sendWelcomeMessage(recipientId, fullname) {
   sendTypingOn(recipientId);
   const messageData = {
      recipient: {
         id: recipientId
      },
      message: {
         attachment: {
            type: 'image',
            payload: {
               url: 'https://i1.wp.com/humorside.com/wp-content/uploads/2017/12/thank-you-meme-01.jpg?w=700&ssl=1',
               is_reusable: true
            }
         },
         quick_replies: [{
               content_type: 'text',
               title: 'FAQs',
               payload: 'FAQ'
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
                  text: `Hi. ${fullName}, please login to your Base Up Account to continue the subscription. If you don't have a Base Up account, you can just Login with Facebook through our app.`,
                  buttons: [{
                     type: 'account_link',
                     url: 'https://staging.baseup.me/messenger-login'
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
                     image_url: 'https://staging.baseup.me/assets/img/home/partners_messenger/felipe.png',
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
                        payload: 'felipeandsons'
                     }, {
                        type: 'postback',
                        title: 'Book Appointment',
                        payload: 'felipeandsons'
                     }]
                  }, {
                     title: 'TUF',
                     image_url: 'https://staging.baseup.me/assets/img/home/partners_messenger/tuf.png',
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
                        payload: 'tuf'
                     }, {
                        type: 'postback',
                        title: 'Book Appointment',
                        payload: 'tuf'
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

function sendFAQ(recipientId) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then(fullName => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            text: `These are the Frequently Asked Questions: `,
            quick_replies: [{
               content_type: 'text',
               title: 'Booking Viewing',
               payload: 'WHERE_BOOKINGS'
            }, {
               content_type: 'text',
               title: 'Paying Appointment',
               payload: 'PAY_APPOINTMENTS'
            }, {
               content_type: 'text',
               title: 'Moving Appointment',
               payload: 'MOVE_APPOINTMENTS'
            }, {
               content_type: 'text',
               title: 'Canceling Appointments',
               payload: 'CANCEL_APPOINTMENTS'
            }, {
               content_type: 'text',
               title: 'Give Feedback?',
               payload: 'GIVE_FEEDBACK'
            }]
         }
      };

      callSendAPI(messageData);
      setTimeout(() => {
         sendTypingOff(recipientId);
         sendReadReceipt(recipientId);
      }, 2000);
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
            quick_replies: [{
               content_type: 'text',
               title: 'FAQs',
               payload: 'FAQ'
            }, {
               content_type: 'text',
               title: 'Check Partners',
               payload: 'CHECK_PARTNERS'
            }, {
               content_type: 'text',
               title: 'Other Concerns',
               payload: 'OTHER_CONCERNS'
            }, {
               content_type: 'text',
               title: 'I\'\m good for now!',
               payload: 'DONE'
            }]
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
            quick_replies: [{
               content_type: 'text',
               title: 'FAQs',
               payload: 'FAQ'
            }, {
               content_type: 'text',
               title: 'Check Partners',
               payload: 'CHECK_PARTNERS'
            }, {
               content_type: 'text',
               title: 'Other Concerns',
               payload: 'OTHER_CONCERNS'
            }, {
               content_type: 'text',
               title: 'I\'\m good for now!',
               payload: 'DONE'
            }]
         }
      };

      callSendAPI(messageData);
      setTimeout(() => {
         sendTypingOff(recipientId);
         sendReadReceipt(recipientId);
      }, 2000);
   });
}

function sendMessage(recipientId, message) {
   sendTypingOn(recipientId);
   const messageData = {
      recipient: {
         id: recipientId
      },
      message: {
         text: message
      }
   };

   callSendAPI(messageData);
   setTimeout(() => {
      sendTypingOff(recipientId);
      sendReadReceipt(recipientId);
   }, 2000);
}

function sendOtherConcerns(recipientId) {
   sendTypingOn(recipientId);
   getCustomerName(recipientId).then(fullName => {
      const messageData = {
         recipient: {
            id: recipientId
         },
         message: {
            text: `Our Customer Service Supervisor will be talking to you shortly. Please wait a little ${fullName}. Thank you.`
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
            text: `Hi. ${fullName} I'm BaseUp's automated assistant. I'm here to help. For your concerns, choose a button below:`,
            quick_replies: [{
                  content_type: 'text',
                  title: 'FAQs',
                  payload: 'FAQ'
               },
               {
                  content_type: 'text',
                  title: 'Check Partners',
                  payload: 'CHECK_PARTNERS'
               }, {
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