var Github = require('github-api')

module.exports = function(object, request) {
  
  getDetails(object)

  function getDetails(object) {
    var subject = object.headers.Subject
    var detailsArray = subject.split(" added you to ")
    var details = { "username": detailsArray[0], 
                    "repo": detailsArray[1] }
    details.repoURI = "https://www.github.com/" 
                  + details.username + "/" 
                  + details.repo + ".git"
    console.log("{red}" + details.username, "added you as a contributor.{/red}")
    cloneRepo(details)
  }
  
  function cloneRepo(details) {
    var github = new Github({
      type: "oauth",
      token: ""
    })
    
    var repo = github.getRepo('jlord', 'reporobot')
    
    repo.write('master', 'hi.md', 'hello it is me', 'add file test', function(err) {
      if (err) console.log(err)
    }) 
  }
}
