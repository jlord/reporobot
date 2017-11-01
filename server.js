var asciify = require('asciify')

var server = require('./index.js')
var pollForInvites = require('accept-invites.js')

var token = process.env['REPOROBOT_TOKEN']
if (!token) throw new Error('Missing REPOROBOT_TOKEN')
var contributors = process.env['CONTRIBUTORS']
if (!contributors) throw new Error('Missing CONTRIBUTORS')

setInterval(pollForInvites, 20000, function callback (err, msg) {
  if (err) console.log(err, msg)
})

server().listen(process.env.PORT || 5563)
asciify('reporobot', { font: 'isometric2' }, function startupArt (err, res) {
  if (err) console.log(err)
  console.log('Starting @reporobot server...')
  console.log(res)
})
