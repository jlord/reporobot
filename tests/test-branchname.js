var Github = require('github-api')
var request = require('request')
var tape = require('tape')

tape("Test wrong branch name", function(t) {

  var github = new Github({
    auth: "oauth",
    token: process.env['REPOROBOT_TOKEN']
  })

  var fork = github.getRepo('reporobot', 'patchwork')
  var upstream = github.getRepo('jlord', 'patchwork')

  createBranch()

  // create new branch on jlord/Patchwork fork
  function createBranch() {
    fork.branch('gh-pages', 'wrongname', function(err) {
      if (err) return t.error(err, "error creating branch on RRs fork")
      makePR()
    })
  }

  function makePR() {
    var pull = {
      title: "[TESTING] Wrong branch name",
      body: "Running a test on a PR with a wrong branch name",
      base: "gh-pages",
      head: "reporobot:" + "wrongbranch"
    }

    upstream.createPullRequest(pull, function(err, pr) {
      if (err) return t.error(err, "error creating PR")
      fetchPR(pr.number)
    })
  }

  function fetchPR(prnum) {
    var baseURL = 'https://api.github.com/repos/jlord/patchwork/issues/'
    var prURL = baseURL + prnum + '/comments'

    request(prURL, function(err, res) {
      if (err) return t.error(err, "error fetching PR")
      if (res.length === 0) return t.fail("No comment created")
      setTimeout(getComment(res), 5000)
    })
  }

  function getComment(res) {
    var lastComment = res.pop()
    t.equal(lastComment.user.login, "reporobot")
    t.end()
  }
})

tape("Test cleanup", function(t) {
  function deleteViaBranch() {
    repo.deleteRef('heads/add-' + viaAccount, function(err) {
      if (err && err.error != '422') return console.log(err, "error deleting ref on via")
        console.log(n, 1 , '...Deleted branch on ' + viaAccount)
        cleanOriginal()
      })
    }
})
