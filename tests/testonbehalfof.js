var Github = require('github-api')
var asciify = require('asciify')

module.exports = function(sourceAccount, viaAccount) {

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
  })
  
  deleteViaBranch()

  // get repository
  function cleanOrignal() {
    var repo = github.getRepo(sourceAccount, 'patchwork')

    // make sure file doesn't already exist, if it does, delete it
    repo.delete('gh-pages', 'contributors/add-' + viaAccount + '.txt', function(err) {
      console.log("Deleted file contributors/add-" + viaAccount + '.txt on source ' + sourceAccount)
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
  function createViaBranch() {
    var repo = github.getRepo(viaAccount, 'patchwork')
    
    repo.branch('gh-pages', 'add-' + viaAccount, function(err) {
      console.log("Create branch add-" + viaAccount + "on " + viaAccount)
      if (err) return console.log(err, "error creating branch on via")
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
    var repo = github.getRepo(viaAccount, 'patchwork')
    
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
    var repo = github.getRepo(viaAccount, 'patchwork') 
    
    repo.deleteRef('heads/add-' + viaAccount, function(err) {
      if (err) console.log("error deleting ref on via")
      console.log('Deleted branch on ' + viaAccount)
      cleanOrignal()
    })
  }
  

}

