var request = require('request');

module.exports = {
   getBranches: getBranches
};

function getBranches(slug) {
   return new Promise((resolve, reject) => {
      const params = {
         include: 'account',
         slug
      };

      request({
         url: 'https://baseup.staging/api/v1/branches/get/',
         qs: params,
      }, (error, response) => {
         if (error) {
            reject(error);
         } else if (response) {
            resolve(response);
         }
      });
   });
}