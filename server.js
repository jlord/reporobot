var bot = require("./index.js")
var touch =  require("./email.js")
var asciify = require('asciify')

bot(touch).listen(process.env.PORT || 5563)
asciify('reporobot', {font:'isometric2'}, function(err, res){ 
  if (err) console.log(err)
  console.log(res)
})
