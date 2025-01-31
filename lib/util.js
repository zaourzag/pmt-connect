const http = require('@aero/http');
const { BASE_URL, AUTH_URL, PMTUSERNAME, PASSWORD, ACCOUNTID } = require('./vars');
// const config = require("./vars");
// console.log(BASE_URL)
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
  }
  
  // Returns the four-digit year corresponding to the ISO week of the date.
  Date.prototype.getWeekYear = function() {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
  }
  function getDate(str) {
    // console.log(str)
    let arr = str.split("-");
     let format = [];
     for (const i of arr) {
         format.push(Number.parseInt(i))
     }
     let test = new Date(format)
     let week = format[0] + "-" + test.getWeek();
    //  console.log(week)
     return week
 }
 let authDetails = {
  context_token: "",
  user_token: ""
};
let authReqJson = {
  username: process.env.PMTUSERNAME,
  password: process.env.PASSWORD,
  browser_info: {
      os_name: "Windows 10",
      browser_name: "Chrome",
      browser_version: 131,
      screen_resolution: "2304.4500406980515x1440.4500254392624"
  }
};
async function test() {
  const result = await http(process.env.BASE_URL + "/api/v2/me", { authDetails }).undici().get();
  // console.log(result)
  return result;

}
 let runamount = 0;
 // console.log(test())
 async function reqauth() {
     // test();
     if (await test().statusCode !== 200) {
         await http(AUTH_URL).post().body(authReqJson).json()
             .then((res) => {
                 // console.log(res);
 
                 authDetails = {
                     "x-api-context": res.result.context_token,
                     "x-api-user": res.result.user_token
                 };
                 // console.log(authDetails)
             })
 
 
     }
 
     runamount++;
    //  console.log(`executed ${runamount} times`)
     return authDetails;
 }
//  console.log(authDetails)
module.exports = {
    getDate,
    reqauth, 
    authDetails
};