var Github = require('github-api')
var asciify = require('asciify')
var btoa = require('btoa')
var request = require('request')

module.exports = function(object, callback) {
  // if it's not an email, return
  if (!object.headers) return
  getDetails(object)

  function getDetails(object) {
    var baseURL = 'https://api.github.com/repos/'
    var subject = object.headers.Subject
    console.log(new Date(), "Recieved email:", subject)

    if (!subject.match("added you to patchwork")) {
      console.log(new Date(), "non relevant email")
      return
    }

    var detailsArray = subject.split(" added you to ")
    var details = { "username": detailsArray[0],
                    "repo": detailsArray[1] }
    details.fileURI = baseURL + details.username + "/"
                    + details.repo + "/contents/contributors/"
                    + "add-" + details.username + ".txt"
    var forSHA = "?ref=add-" + details.username

    console.log(new Date(), details.username, "added Reporobot as a collaborator.")
    asciiArt(details)
  }

  function asciiArt(details) {
    asciify(details.username, {font:'isometric2'}, function(err, res){
      if (err) return callback(err, "Ascii art error")
      writeRepo(res, details)
    })
  }

  function writeRepo(artwork, details) {

    var reqHeaders = {
      'User-Agent': 'request',
      'Authorization': 'token ' + process.env['REPOROBOT_TOKEN'] }

    var options = {
      headers: reqHeaders,
      url: details.fileURI + forSHA,
      json: true,
      body: {
        "branch": "add-" + details.username,
        "committer": {
          "name": "reporobot",
          "email": "60ebe73fdad8ee59d45c@cloudmailin.net" },
        "sha": "",
        "content": btoa(artwork),
        "message": "drew a picture :art:" }}

    console.log("opts", options)
    request.get(options, function(err, res, body) {
      if (err) return callback(err, "Error fetching SHA")
      console.log("body on sha req", body)
      if (res.statusCode !== 200) return console.log("Didn't get SHA", body.message)
      options.body.sha = body.sha
      options.url = details.fileURI
      request.put(options, function(err, res, body) {
        if (err) return callback(err, "Error collabing on forked repo.")
        if (res.statusCode !== 200) return console.log("Didn't collab", body.message)
        console.log(new Date(), "Commited to a repo")
      })
    })
  }
}
