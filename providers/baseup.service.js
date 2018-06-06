const request = require('request');
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

module.exports = {
   getBranches: getBranches
};

function getBranches(slug) {
   return new Promise((resolve, reject) => {
      request({
         uri: 'https://staging.baseup.me/api/v1/branches/get/',
         qs: {
            include: 'account',
            slug
         },
         method: 'GET'
      }, (error, response, body) => {
         if (error) {
            reject(error);
         } else if (response) {
            new JSONAPIDeserializer().deserialize(response, (err, resp) => {
               if (err) {
                  reject(err);
               } else {
                  resolve(resp);
               }
            });
         }
      });
   });
}