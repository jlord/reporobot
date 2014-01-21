// var Github = require('github-api')
// 
// module.exports = function(username, callback) {
//   
//   var github = new Github({
//       auth: "oauth",
//       token: process.env['REPOROBOT_TOKEN']
//     })
//   
//   var issues = github.getIssues('jlord', 'patchwork')
//   var options = {username: 'jlord', repo: 'patchwork'}
//   
//   issues.list(options, function(err, issues) {
//     if (err) return callback(err)
//     
//     var pr = false
//     issues.forEach(function(issue) {
//       // what is the max number of issues that it returns?
//       var prStatus = issue.pull_request.html_url
//       if (issue.user.login.match(username) && prStatus != null) {
//         pr = true
//         console.log([new Date(), username, " made a pull request."])
//         callback(err, pr)
//       }
//     })
//     callback(err, pr)
//   })
// }

module.exports = function(username, callback) {

  var request = require('request')
  var baseURL = 'https://api.github.com/repos/jlord/patchwork/issues?state=closed'

  var options = {
      url: baseURL 
      json: true,
      headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      }
  }

  request(options, getIssues)


  function getIssues(error, response, body) {
  
    console.log(body)
  }

}

// https://api.github.com/repos/mojombo/jekyll/issues?state=closed"