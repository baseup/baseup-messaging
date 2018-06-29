const _ = require('lodash');
const request = require('request');

const baseupServ = require('./baseup.service');
const facebookConst = require('../settings/facebook.constants');

const quickRepliesBtn = [{
            content_type: 'text',
            title: 'Make an appointment',
            payload: 'MAKE_APPOINTMENT'
      },
      {
            content_type: 'text',
            title: 'Check Partners',
            payload: 'CHECK_PARTNERS'
      }, {
            content_type: 'text',
            title: 'Other Concerns',
            payload: 'OTHER_CONCERNS'
      }, {
            content_type: 'text',
            title: 'Subscribe',
            payload: 'SUBSCRIBE'
      }, {
            content_type: 'text',
            title: 'I\'\m good for now!',
            payload: 'DONE'
      }
];

const btnWithSubscribe = _.remove(quickRepliesBtn, (val) => {
      return val.payload === 'DONE';
});

const btnWithDone = _.remove(quickRepliesBtn, (val) => {
      return val.payload === 'SUBSCRIBE';
});

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
                        quick_replies: quickRepliesBtn
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
                                    text: `Hi ${fullName}, please login to your Base Up Account to continue the subscription. If you don't have a Base Up account, you can just Login with Facebook through our app.`,
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

function sendPartners(recipientId, businesses) {
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
                                    elements: businesses
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

function sendDefaultMessage(recipientId) {
      sendTypingOn(recipientId);
      getCustomerName(recipientId).then(fullName => {
            const messageData = {
                  recipient: {
                        id: recipientId
                  },
                  message: {
                        text: `What else can i do for you ${fullName}?`,
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

function sendMainQuickReply(recipientId, type) {
      sendTypingOn(recipientId);
      getCustomerName(recipientId).then((fullName) => {
            const messageData = {
                  recipient: {
                        id: recipientId
                  },
                  message: {
                        text: `Hi ${fullName}, I'm Vicky. BaseUp's automated bot. How can I help you today?`,
                  }
            };

            messageData.message.quick_replies = (type && type === 'welcome') ? btnWithSubscribe : quickRepliesBtn;

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