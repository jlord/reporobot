// Reporobot should collaborate with ascii art on users' repos
// when they add it as a collaborator. Test that it does actually
// do this!

var request = require('request')

var emailData = require('./email-payload.json')

var options = {
  url: 'http://reporobot.jlord.us/push',
  json: true,
  body: emailData
}

request.post(options, function done(err, res, body) {
  // check that reporobot edited
  checkForCommit()
})

function checkForCommit() {
  // fetch goldenrod/patchwork commits,
  // see if reporobot did it in last minute
}
