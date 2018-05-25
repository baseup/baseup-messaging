const config = require('config');

const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
   process.env.MESSENGER_APP_SECRET :
   config.get('appSecret');

const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
   (process.env.MESSENGER_VALIDATION_TOKEN) :
   config.get('validationToken');

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
   (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
   config.get('pageAccessToken');

const SERVER_URL = (process.env.SERVER_URL) ?
   (process.env.SERVER_URL) :
   config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
   console.error("Missing config values");
   process.exit(1);
}
module.exports = {
   APP_SECRET: APP_SECRET,
   VALIDATION_TOKEN: VALIDATION_TOKEN,
   PAGE_ACCESS_TOKEN: PAGE_ACCESS_TOKEN,
   SERVER_URL: SERVER_URL
};