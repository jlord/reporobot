var Github = require('github-api')
var asciify = require('asciify')
var request = require('request')

module.exports = function(sourceAccount, viaAccount) {

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
  })

  var repo = github.getRepo(viaAccount, 'patchwork')

  deleteViaBranch()

  // get repository
  function cleanOrignal() {
    var origRepo = github.getRepo(sourceAccount, 'patchwork')

    // make sure file doesn't already exist, if it does, delete it
    origRepo.delete('gh-pages', 'contributors/add-' + viaAccount + '.txt', function(err) {
      if (err && err.error != "404") console.log(err.responseText, "Error deleting " + viaAccount + '.txt on original')
      console.log("Deleted file contributors/add-" + viaAccount + '.txt on source ' + sourceAccount)
      checkBranch()
    })
  }


  // make sure branch doesn't already exist, if it does, delete it
  function checkBranch() {
    repo.listBranches(function(err, branches) {
      if (err) return console.log(err, "error reading branches")
      for (var i = 0; i < branches.length; i++) {
        if (branches[i].match("add-" + viaAccount)) return deleteBranch(repo)
      }
      createViaBranch()
    })
  }

  // delete branch
  function deleteBranch() {
    repo.deleteRef('heads/add-' + viaAccount, function(err) {
      if (err) return console.log(err, "error deleting ref")
      createViaBranch()
      return console.log('Deleted branch /add-'+ viaAccount + ' on source ' + sourceAccount)
    })
  }

  // create branch
  // function createViaBranch() {
  //   console.log("Repo", viaAccount, "/patchwork")
  //   repo.branch('gh-pages', 'add-' + viaAccount, function(err) {
  //     if (err) console.log(err, "error creating branch on via")
  //     console.log("Created branch add-" + viaAccount + " on " + viaAccount)
  //
  //     createArt()
  //   })
  // }

  function createViaBranch() {
    console.log("Repo", viaAccount, "/patchwork")
    var headers = {"user-agent": "reporobot", "auth": "oauth"}
    headers["token"] = 'token ' + process.env['REPOROBOT_TOKEN']
    var url = 'https://api.github.com/repos/' + viaAccount + '/patchwork/git/refs/heads/gh-pages'
    console.log(url)
    request(url, {json: true, headers: headers}, function(error, response, body) {
      if (error) return console.log(error, "Error getting sha")
      createViaBranchActually(body.object.sha)

    })

  }
  function createViaBranchActually(sha) {
    var url = 'https://api.github.com/repos/' + viaAccount + '/patchwork/git/refs'
    var headers = {"user-agent": "reporobot", "auth": "oauth"}
    headers["token"] = 'token ' + process.env['REPOROBOT_TOKEN']
    request(url, {json: true, headers: headers, method: 'put', "ref": "refs/heads/add-" + viaAccount, "sha": sha},
      function(error, response, body) {
        if (error) return console.log(error, "Error making new branch")
        console.log(body)
        console.log("Created branch add-" + viaAccount + " on " + viaAccount)
        createArt()
    })
  }


  // create ascii art
  function createArt() {
    asciify(viaAccount, {font:'isometric2'}, function(err, res){
      if (err) callback(err, "Error generating ascii art to test against")
      console.log("Drew art for " + viaAccount)
      writeFile(res)
    })
  }

  // write file to repository
  function writeFile(art) {

    repo.write('add-' + viaAccount, 'contributors/add-' + viaAccount + '.txt', art, 'TEST add-' + viaAccount, function(err) {
      if (err) return console.log(err, "error writing file")
      console.log("Wrote file contributors/add-" + viaAccount + ".txt to " + viaAccount)
      createPR()
    })
  }

  // create pull request
  function createPR() {
    var pull = {
      title: "TEST add " + viaAccount,
      body: "Testing multiple PRs, this one " + viaAccount,
      base: "gh-pages",
      head: viaAccount + ":" + "add-" + viaAccount
    }

  var pullReqRepo = github.getRepo(sourceAccount, 'patchwork')

    pullReqRepo.createPullRequest(pull, function(err, pullRequest) {
      if (err) return console.log(err, "error creating PR")
      console.log("Created Test PR for " + viaAccount)
    })
  }

function deleteViaBranch() {

  repo.deleteRef('heads/add-' + viaAccount, function(err) {
    if (err && err.error != "404") console.log(err.responseText, "error deleting ref on via")
    console.log('Branch on ' + viaAccount + " is deleted.")
    cleanOrignal()
  })
}

}
