var Github = require('github-api')
var asciify = require('asciify')

module.exports function theMotions(sourceAccount, viaAccount) {

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
  })

  // get repository
  function cleanOrignal() {
    var repo = github.getRepo(sourceAccount, 'patchwork')

    // make sure file doesn't already exist, if it does, delete it
    repo.delete('gh-pages', 'contributors/add-' + viaAccount + '.txt', function(err) {
      checkBranch(repo)
    })
  }


  // make sure branch doesn't already exist, if it does, delete it
  function checkBranch(repo) {
    repo.listBranches(function(err, branches) {
      if (err) return console.log(err, "error reading branches")
      for (var i = 0; i < branches.length; i++) {
        if (branches[i].match("add-" + viaAccount)) return deleteBranch()
      }
      createBranch()
    })
  }

  // delete branch
  function deleteBranch() {
    repo.deleteRef('heads/add-' + viaAccount, function(err) {
      if (err) return console.log(err, "error deleting ref")
      createViaBranch()
      return console.log('Deleted branch on source')
    })
  }

  // create branch
  function createViaBranch() {
    var repo = github.getRepo(viaAccount, 'patchwork')
    
    repo.branch('gh-pages', 'add-' + viaAccount, function(err) {
      console.log("Create branch on Via")
      if (err) return console.log(err, "error creating branch on via")
      createArt(repo)
    })
  }

  // create ascii art
  function createArt(repo) {
    asciify(viaAccount, {font:'isometric2'}, function(err, res){ 
      if (err) callback(err, "Error generating ascii art to test against")
      writeFile(res, repo)
    })
  }

  // write file to repository
  function writeFile(art, repo) {
    repo.write('add-' + viaAccount, 'contributors/add-' + viaAccount + '.txt', art, 'commiting-via-test', function(err) {
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
      head: viaAccount + ":" + "add-" + viaAccount
    }

  var pullReqRepo = github.getRepo(sourceAccount, 'patchwork')

    pullReqRepo.createPullRequest(pull, function(err, pullRequest) {
      if (err) return console.log(err, "error creating PR")
      console.log("Created Test PR for " + viaAccount)
      deleteViaBranch()
    })
  }
  
  function deleteViaBranch() {
    var repo = github.getRepo(viaAccount, 'patchwork') 
    
    repo.deleteRef('heads/add-' + viaAccount, function(err) {
      if (err) return console.log(err, "error deleting ref on via")
      return console.log('Deleted branch on via')
    })
  }
  

}

