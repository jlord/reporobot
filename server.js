var bot = require("./index.js")
var touch =  require("./email.js")
var asciify = require('asciify')

var token = process.env['REPOROBOT_TOKEN']
if (!token) throw new Error("Missing REPOROBOT_TOKEN")
var contributors = process.env['CONTRIBUTORS']
if (!contributors) throw new Error("Missing CONTRIBUTORS")

console.log('Env', {token: token, contributors: contributors})

bot(touch).listen(process.env.PORT || 5563)
asciify('reporobot', {font:'isometric2'}, function(err, res){ 
  if (err) console.log(err)
  console.log(res)
})
