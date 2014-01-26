// create file on branch with ascii art
// push
// create pull request

// #!/usr/bin/env node

var Github = require('github-api')
var asciify = require('asciify')

var github = new Github({
    auth: "oauth",
    token: process.env['REPOROBOT_TOKEN']
})

// get repository
var repo = github.getRepo('jlord', 'patchwork')

// make sure branch doesn't already exist, if it does, delete it
repo.listBranches(function(err, branches) {
  if (err) return console.log(err, "error reading branches")
  branches.forEach(function (branch) {
    if (branch.match("add-reporobot")) return deleteBranch()
  })
  createBranch()
})

// delete branch
function deleteBranch() {
  repo.deleteRef('heads/add-reporobot', function(err) {
    if (err) return console.log(err, "error deleting ref")
    createBranch()
  })
}

// create branch
function createBranch() {
  repo.branch('gh-pages', 'add-reporobot', function(err) {
    if (err) return console.log(err, "error creating branch")
    createArt()
  })
}

// create ascii art
function createArt() {
  asciify('reporobot', {font:'isometric2'}, function(err, res){ 
    if (err) callback(err, "Error generating ascii art to test against")
    writeFile(res)
  })
}

// write file to repository
function writeFile(art) {
  repo.write('add-reporobot', 'contributors/add-reporobot.txt', art, 'commiting-test', function(err) {
    if (err) return console.log(err, "error writing file")
    createPR()
  })
}

// create pull request
function createPR() {
  var pull = {
    title: "Testing",
    body: "Testing PR chain of events",
    base: "gh-pages",
    head: "add-reporobot"
  }

  repo.createPullRequest(pull, function(err, pullRequest) {
    if (err) return console.log(err, "error creating PR")
    console.log("Created Test PR")
  })
}

