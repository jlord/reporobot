var Github = require('github-api')

module.exports = function(username, callback) {
  console.log("I got this username", username)

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
    })

  var repo = github.getRepo('jlord', 'patchwork')

  repo.show(function(err, repo) {
    console.log(repo)
  })
}
