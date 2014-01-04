module.exports = function(object, request) {
//  console.log("REQ", request)
//  console.log("OBJ", object)
  
  getDetails(object)

  function getDetails(object) {
    var subject = object.headers.Subject
    var detailsArray = subject.split(" added you to ")
    var details = { "username": detailsArray[0], 
                    "repo": detailsArray[1] }
    details.repoURI = "https://www.github.com/" 
                  + details.username + "/" 
                  + details.repo + ".git"
    console.log(details)
    
  }
}
