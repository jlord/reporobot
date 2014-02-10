var request = require('request')

module.exports = function(username, callback) {

  var baseURL = 'https://api.github.com/repos/jlord/patchwork/issues?state=closed'

  var options = {
      url: baseURL,
      json: true,
      headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      }
  }

  function getIssues(error, response, body) {
    var issues = body
    var pr = false

    for (var i = 0; i < issues.length; i++) {
      var issue = issues[i]
      var user = issue.user.login.toLowerCase()
      // what is the max number of issues that it returns?
      var prStatus = issue.pull_request.html_url
      if (user.match(username.toLowerCase()) && prStatus != null) {
        pr = true
        console.log([new Date(), username, " made a pull request."])
        return callback(error, pr)
      }
    }
    callback(error, pr)
  }

  request(options, getIssues)
}
