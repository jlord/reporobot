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

// make sure file doesn't already exist, if it does, delete it
repo.delete('gh-pages', 'contributors/add-reporobot.txt', function(err) {
  checkBranch()
})

// make sure branch doesn't already exist, if it does, delete it
function checkBranch() {
  repo.listBranches(function(err, branches) {
    if (err) return console.log(err, "error reading branches")
    for (var i = 0; i < branches.length; i++) {
      if (branches[i].match("add-reporobot")) return deleteBranch()
    }
    createBranch()
  })
}

// delete branch
function deleteBranch() {
  repo.deleteRef('heads/add-reporobot', function(err) {
    if (err) return console.log(err, "error deleting ref")
    createBranch()
    return console.log('Deleted branch')
  })
}

// create branch
function createBranch() {
  repo.branch('gh-pages', 'add-reporobot', function(err) {
    console.log("Create branch")
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

