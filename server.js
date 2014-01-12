var bot = require("./index.js")
var touch =  require("./touch.js")

bot(touch).listen(process.env.PORT || 5563)
console.log("listening")
