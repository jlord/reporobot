var Github = require('github-api')

module.exports = function(username, callback) {

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
    })

  var issues = github.getIssues('jlord', 'patchwork')
  
  var options = {username: 'jlord', repo: 'patchwork'}
  
  issues.list(options, function(err, issues) {
    var pr = issue.pull_request.html_url
    issues.forEach(function(issues) {
      if (issue.user.login.match(username) && pr != null)
        var pr = true
        callback(pr)
      else {
        var pr = false
        callback(pr)
    }
  })
}
