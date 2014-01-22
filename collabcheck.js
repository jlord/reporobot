var Github = require('github-api')

module.exports = function(username, callback) {

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
  })

  var repo = github.getRepo(username, 'patchwork')

  repo.show(function(err, repo) {
    if (err) return callback(err)
    
    var permissions = repo.permissions
    if (permissions.push) {
      var collab = true
      callback(err, collab)
    }
    else {
      var collab = false
      callback(err, collab)
    }
  })
}
