module.exports = function(object, request) {
  console.log("REQ", request)
  console.log("OBJ", object)
  
  getUsername(object)

  function getUsername(object) {
    var subject = object.headers.Recieved.Subject
    console.log(subject)
  }
}
