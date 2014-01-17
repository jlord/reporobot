var bot = require("./index.js")
var touch =  require("./touch.js")
var asciify = require('asciify')

bot(touch).listen(process.env.PORT || 5563)
//console.log("listening") <-- so boring! o\ so fun!
asciify('reporobot', {font:'isometric2'}, function(err, res){ 
  if (err) console.log(err)
  console.log(res)
})
