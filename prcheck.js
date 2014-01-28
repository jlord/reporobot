var request = require('request')

module.exports = function(username, callback) {

  var baseURL = 'https://api.github.com/repos/jlord/patchwork/issues?state=open'

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
      // what is the max number of issues that it returns?
      var prStatus = issue.pull_request.html_url
      if (issue.user.login.match(username) && prStatus != null) {
        pr = true
        console.log([new Date(), username, " made a pull request."])
        return callback(error, pr)
      }
    }
    callback(error, pr)  
  }
  
  request(options, getIssues)
}
