var Github = require('github-api')

module.exports = function(username, callback) {

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
    })

  var repo = github.getRepo(username, 'patchwork')

  repo.show(function(err, repo) {
    console.log("repo", repo)
  })
}
