var Github = require('github-api')
var asciify = require('asciify')

module.exports = function(object, request) {

  getDetails(object)

  function getDetails(object) {
    console.log(["email", object.plain])
    // need callback
    // console.log("emailbody", object.plain)
    // add if not from github, don't do anything
    var subject = object.headers.Subject
    console.log([new Date(), "Recieved email:", subject])
    
    if (!subject.match("added you to")) return
    
    var detailsArray = subject.split(" added you to ")
    var details = { "username": detailsArray[0], 
                    "repo": detailsArray[1] 
                  }
    details.repoURI = "https://www.github.com/" 
                    + details.username + "/" 
                    + details.repo + ".git"
    console.log(details.username, "added you as a contributor.")
    asciiArt(details)
  }
  
  function asciiArt(details) {
    asciify(details.username, {font:'isometric2'}, function(err, res){ 
      if (err) console.log("ascii error", err)
      var artwork = res
      writeRepo(artwork, details)
    })
  }
  
  function writeRepo(artwork, details) {
    
    var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
    })
    
    var repo = github.getRepo(details.username, details.repo)

    var branchName = "add-" + details.username 
    var filePath = 'contributors/add-' + details.username + '.txt'
    
    // reporobot will overwrite the existing file which should just
    // contain a username
      
    repo.write(branchName, filePath, artwork, 'drew a picture', function(err) {
      if (err) console.log("Error writing to repo", err)
      console.log([new Date(), "Commited to a repo"])
    }) 
  }
}
