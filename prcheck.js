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

  request(options, getIssues)

  function getIssues(error, response, body) {
    var issues = body
    var pr = false
    
    issues.forEach(function(issue) {
      // what is the max number of issues that it returns?
      var prStatus = issue.pull_request.html_url
      if (issue.user.login.match(username) && prStatus != null) {
        pr = true
        console.log([new Date(), username, " made a pull request."])
        callback(error, pr)
      }
    })
    callback(error, pr)  
  }
  
  request(options, getIssues)
}