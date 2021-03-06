const config = require('config');

const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
   process.env.MESSENGER_APP_SECRET :
   config.get('app_secret');

const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
   (process.env.MESSENGER_VALIDATION_TOKEN) :
   config.get('validation_token');

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
   (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
   config.get('access_token');

const SERVER_URL = (process.env.SERVER_URL) ?
   (process.env.SERVER_URL) :
   config.get('server_URL');

const PAGE_PSID = (process.env.PAGE_PSID) ?
   (process.env.PAGE_PSID) :
   config.get('page_psid');

const BASE_URL = (process.env.BASE_URL) ?
   (process.env.BASE_URL) :
   config.get('base_url');

const API_URL = (process.env.API_URL) ?
   (process.env.API_URL) :
   config.get('api_url');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
   console.error("Missing config values");
   process.exit(1);
}
module.exports = {
   API_URL: API_URL,
   BASE_URL: BASE_URL,
   PAGE_PSID: PAGE_PSID,
   SERVER_URL: SERVER_URL,
   APP_SECRET: APP_SECRET,
   VALIDATION_TOKEN: VALIDATION_TOKEN,
   PAGE_ACCESS_TOKEN: PAGE_ACCESS_TOKEN
};