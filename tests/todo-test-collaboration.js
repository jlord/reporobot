// Reporobot should collaborate with ascii art on users' repos
// when they add it as a collaborator. Test that it does actually
// do this!

var request = require('request')
var tape = require('tape')

var emailData = require('./email-payload.json')

// var options = {
//   url: 'http://reporobot.jlord.us/push',
//   json: true,
//   body: emailData }
//
// request.post(options, function done(err, res, body) {
//   // check that reporobot edited
//   checkForCommit()
// })

function checkForCommit() {

  var timeframe = new Date(Date.now() - 20000)
  var options = {
    headers: { 'User-Agent': 'request' },
    url: 'https://api.github.com/repos/goldenrod/patchwork/commits',
    json: true,
    qs: {
      sha: 'add-goldenrod',
      author: 'reporobot',
      since: timeframe.toISOString()
    }
  }

  request(options, function fetchedCommit(err, res, body) {
    if (err) return console.log(err)
    if (res.statusCode !== 200) return console.log("ERROR", res.statusCode, body)
    if (body.length < 1) return console.log("ERROR", "No commits")
    readCommits(body)
  })
}

function readCommits(commits) {

}

checkForCommit()
