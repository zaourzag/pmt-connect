require('dotenv').config()
const { BASE_URL, PMTUSERNAME, PASSWORD, ACCOUNTID } = process.env;
const AUTH_URL = BASE_URL + "/pmtLoginSso";
module.exports = {
    BASE_URL,
    PMTUSERNAME,
    PASSWORD,
    ACCOUNTID,
    AUTH_URL
}