var Github = require('github-api')
var asciify = require('asciify')

module.exports = function(object, callback) {
  // if it's not an email, return
  if (!object.headers) return
  console.log(["EMAIL OBJ", object])
  getDetails(object)

  function getDetails(object) {
    
    var subject = object.headers.Subject
    console.log([new Date(), "Recieved email:", subject])
    
    if (!subject.match("added you to patchwork")) {
      console.log([new Date(), "non relevant email"])
      return
    }
    
    var detailsArray = subject.split(" added you to ")
    var details = { "username": detailsArray[0], 
                    "repo": detailsArray[1] 
                  }
    details.repoURI = "https://www.github.com/" 
                    + details.username + "/" 
                    + details.repo + ".git"
    
    console.log([new Date(), details.username + "added Reporobot as a contributor."])
    
    asciiArt(details)
  }
  
  function asciiArt(details) {
    asciify(details.username, {font:'isometric2'}, function(err, res){ 
      if (err) return callback(err, "Ascii art error")
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
      if (err) return callback(err, "Error collabing on forked repo.")
      console.log([new Date(), "Commited to a repo"])
    }) 
  }
}
