var Github = require('github-api')
var request = require('request')
var debug = require('debug')('TEST')
var tape = require('tape')

var github = new Github({
  auth: "oauth",
  token: process.env['REPOROBOT_TOKEN']
})

var reqHeaders = {
  'User-Agent': 'request',
  'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
}

var baseURL = 'https://api.github.com/repos/'
var fork = github.getRepo('reporobot', 'patchwork')
var upstream = github.getRepo('jlord', 'patchwork')
var prnum

// Create a branch on RR's fork of Patchwork. Then create a file on that
// branch so that you can create a PR. Check to see if RR commented on that PR.
// Delete branch when finished (or have failed).

tape("Test wrong branch name", function(t) {

  createBranch()

  function createBranch() {
    debug("⬢ Creating branch")
    fork.branch('gh-pages', 'wrongname', function(err) {
      if (err) return t.error(err, "Error creating branch on RRs fork")
      setTimeout(createDiff(), 5000)
    })
  }

  function createDiff() {
    var options = {
      headers: reqHeaders,
      url: baseURL + "reporobot/patchwork/contents/test.md",
      json: true,
      body: {
        "path": "test.md",
        "branch": "wrongname",
        "message": "TEST",
        "content": "bXkgbmV3IGZpbGUgY29udGVudHM=",
        "committer": {
          "name": "reporobot",
          "email": "60ebe73fdad8ee59d45c@cloudmailin.net"
        }
      }
    }

    request.put(options, function(err, res, body) {
      debug("⬢ Creating diff")
      if (err) {
        t.error(err, "Error making new file on branch", body)
        return t.end()
      }
      setTimeout(function() { makePR() }, 5000)
    })
  }

  function makePR() {
    debug("⬢ Creating PR")
    var pull = {
      title: "[TESTING] Wrong branch name",
      body: "Running a test on a PR with a wrong branch name",
      base: "gh-pages",
      head: "reporobot:" + "wrongname"
    }

    upstream.createPullRequest(pull, function(err, pr) {
      if (err) return t.error(err, "error creating PR")
      prnum = pr.number
      fetchPR()
    })
  }

  function fetchPR() {
    debug("⬢ Fetching PR")
    var prURL = baseURL + 'jlord/patchwork/issues/' + prnum + '/comments'
    var options = { headers: reqHeaders, json: true, url: prURL }

    request(options, function(err, res, body) {
      if (err) {
        t.error(err, "error fetching PR")
        return t.end()
      }
      if (res.length === 0) {
        t.fail("No PR created")
        return t.end()
      }
      // Give RR time to respond to PR
      setTimeout(function() { getComment(res,body) }, 15000)
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
    debug("⬢ Deleting branch")
    fork.deleteRef('heads/wrongname', function(err) {
      if (err && err.error != '422') return t.error(err, "Error deleting branch")
      console.log("Branch deleted on RR fork.")
      closePR()
      })
    }

    function closePR() {
      var options = {
        url: 'https://api.gihtub.com/repos/jlord/patchwork/pulls/' + prnum,
        json: true,
        body: {
          'state': 'closed'
        }
      }
      request.patch(options, function(err) {
        if (err) t.error(err, "Error closing PR")
        console.log("Deleted test PR")
        t.end()
      })
    }
})
