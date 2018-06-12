const request = require('request');
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

module.exports = {
   getBranches: getBranches,
   getAuthBaseupUser: getAuthBaseupUser
};

function getBranches(slug) {
   return new Promise((resolve, reject) => {
      request({
         uri: 'https://testing.baseup.me/api/v1/branches/get/',
         qs: {
            include: 'account',
            slug
         },
         method: 'GET'
      }, (error, response, body) => {
         if (error) {
            reject(error);
         } else if (response) {
            resolve(body);
         }
      });
   });
}

function getAuthBaseupUser(authCode) {
   return new Promise((resolve, reject) => {
      request({
            url: 'https://testing.baseup.me/api/v1/users/get_auth_user/',
            headers: {
               'Authorization': `Bearer ${authCode}`,
               'COntent-Type': 'application/vnd.api+json'
            }
         },
         (error, response, body) => {
            if (error) {
               reject(error);
            } else if (response) {
               new JSONAPIDeserializer({
                  keyForAttribute: 'snake_case'
               }).deserialize(JSON.parse(body), (err, users) => {
                  if (err) {
                     reject(err);
                  } else if (users) {
                     resolve(users);
                  }
               });
            }
         }
      );
   });
}