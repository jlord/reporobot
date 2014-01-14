var Github = require('github-api')

module.exports = function(username, callback) {

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
    })

  var repo = github.getRepo(username, 'patchwork')

  repo.show(function(err, repo) {
    var permissions = repo.permissions
    if (permissions.push) console.log("true")
    else console.log("reporobot doesn't have push access")
  })
}
