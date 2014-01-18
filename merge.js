// on new PR ->
// verify pr content matches username
// merge
// on merge ->
// rewrite index.html template
// push
// new gh-pages is launched

var request = require('request')
var asciify = require('asciify')
var baseURL = 'https://api.github.com/repos/jlord/patchwork/'
// are these bad as globals?
var time = ""
var username = ""
var prNum = ""

module.exports = function(pullreq, req) {
  prNum = pullreq.number
  
  // make sure it's not a non-workshop, normal PR
  if (pullreq.base.ref.match(user.login)) return

  var options = {
      url: baseURL +'pulls/' + prNum,
      json: true,
      headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      }
  }
  
  function getTime(error, response, body) {
    if (error) console.log(error)
      if (!error && response.statusCode == 200) {
          var info = body
          time = info.created_at
          username = info.user.login
          getFile(prNum)
      }
  }
  
  request(options, getTime)
  
  function getFile(prNum) {
    var options = {
        url: baseURL + 'pulls/' + prNum + '/files',
        json: true,
        headers: {
            'User-Agent': 'request',
            'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
        }
    }
    
    request(options, function returnFiles(error, response, body) {
      if (error) console.log(error)
        if (!error && response.statusCode == 200) {
            var prInfo = body[0]
            verifyFilename(prInfo)
        }
    })
  }
}

function verifyPRContent(prInfo) {
  
}

function verifyFilename(prInfo) {
  // add /contributors/ to filename
  var filename = prInfo.filename
  // if (filename.match('/contributors/add-' + username + '.md')) {
  if (filename.match('test.md')) {
    console.log("Filename: MATCH")
    verifyContent(prInfo)
  }
  else {
    var message = 'Filename is different than expected: /contributors/add-' + username 
    writeComment(message, prNum)
  }
}

function verifyContent(prInfo) {
  // pull out the actual pr content
  var patchArray = prInfo.patch.split('@@')
  var patch = patchArray.pop()
  // generate the expected content
  asciify(username, {font:'isometric2'}, function(err, res){ 
    if (err) console.log(err)
    if (res.match(patch)) {
      console.log("Content: MATCH")
      mergePR(prNum)
    }
    else {
      var message = "Ascii art wasn't as expected, did something change?"
      writeComment(message, prNum)
    }
  })
}

function writeComment(message, prNum) {
  console.log("uh oh, writing comment")
   var options = {
      url: baseURL + 'issues/' + prNum + '/comments',
      headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      },
      json: {'body': message}
  }
  
  request.post(options, function done(error, response, body) {
    if (error) console.log(error)
  })
}

function mergePR(prNum) {
  console.log("Merging..")
  var message = "Merging PR from @" + username
  var options = {
     url: baseURL + 'pulls/' + prNum + '/merge',
     headers: {
         'User-Agent': 'request',
         'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
     },
     json: {'commit_message': message}
 }
 
 request.put(options, function done(error, response, body) {
   if (error) console.log(error)
   if (!error && response.statusCode == 200) {
       console.log("MERGED")
       // then build page
   }
 })
}