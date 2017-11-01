var asciify = require('asciify')
var btoa = require('btoa')
var request = require('request')

// TODO rename file, no more email worries,
// just draw the ascii art

module.exports = function (username, callback) {

  var baseURL = 'https://api.github.com/repos/'
  var details = {}

  details.username = username
  details.repo = username + '/patchwork',
  details.fileURI = baseURL + details.repo + '/contents/contributors/' + 'add-' + username + '.txt'
  details.forSHA = '?ref=add-' + details.username

  asciify(details.username, { font: 'isometric2' }, function (err, res) {
    if (err) return callback(err, 'Ascii creating error')
    writeRepo(res, details)
  })

  function writeRepo (artwork, details) {
    var reqHeaders = {
      'User-Agent': 'request',
      'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
    }

    var options = {
      headers: reqHeaders,
      url: details.fileURI + details.forSHA,
      json: true,
      body: {
        'branch': 'add-' + details.username,
        'committer': {
          'name': 'reporobot',
          'email': '60ebe73fdad8ee59d45c@cloudmailin.net' },
        'sha': '',
        'content': btoa(artwork),
        'message': 'drew a picture :art:' }}

    request.get(options, function getSHA (err, res, body) {
      if (err) return callback(err, 'Error fetching SHA')
      if (res.statusCode !== 200) return callback('Did not get SHA', body.message)
      options.body.sha = body.sha
      options.url = details.fileURI
      request.put(options, function commitToRepo (err, res, body) {
        if (err) return callback(err, 'Error collabing on forked repo.')
        if (res.statusCode !== 200) return callback('Did not collab', body.message)
        console.log(new Date(), 'Commited to', details.username, 'repo')
      })
    })
  }
}
