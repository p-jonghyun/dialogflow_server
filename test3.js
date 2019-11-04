

var request = require("request")

var options = {
 // url: "http://114.70.21.29/rest/control?object=000D6F000C13FE5D&endpoinnt=1&action=off",
  url : "http://114.70.21.30/rest/device",
  auth: {
    user: "admin",
    password: "qwer@1234", 
    sendImmediately : false,
  }
}

request.get(options, function(err, res, body) {
  if(err) console.log(err);
  else console.log(body);
});
