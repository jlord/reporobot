// on new PR ->
// verify pr content matches username
// merge
// on merge ->
// rewrite index.html template
// push
// new gh-pages is launched

var request = require('request')
var asciify = require('asciify')

var time = ""
var username = ""

module.exports = function(pullreq, req) {
  var prNum = pullreq.number
  console.log('https://api.github.com/repos/jlord/patchwork/pulls/' + prNum)

  var options = {
      url: 'https://api.github.com/repos/jlord/patchwork/pulls/' + prNum,
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
          console.log(time, username)
          getFile(prNum)
      }
  }
  
  request(options, getTime)
  
  function getFile(prNum) {
    var options = {
        url: 'https://api.github.com/repos/jlord/patchwork/pulls/' + prNum + '/files',
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
            // verifyContent(prInfo.patch)
            writeComment(prNum)
        }
    })
  }
}

function verifyPRContent(prInfo) {
  
}

function verifFilename(filename) {
  // add /contributors/ to filename
  if (filename.match('add-' + username + '.md')) {
    return true
  }
  else console.error("Filename did not match expected pattern")
  // what should I do when the filename is incorrect, create an issue
  // or change it for the user?
  // actually - verify that in the pr challange, that way you know 
  // you'll get the right one eventually
}

function verifyContent(patch) {
  // pull out the actual pr content
  var patchArray = patch.split('@@')
  var patch = patchArray.pop()
  console.log(patch)
  // generate the expected content
  asciify(username, {font:'isometric2'}, function(err, res){ 
    console.log(res)
    if (res.match(patch)) console.log("true")
    else console.log("no match")
  })
}

function writeComment(prNum) {
  // /repos/:owner/:repo/issues/:number/comments
 
  var options = {
      url: 'https://api.github.com/repos/jlord/patchwork/issues/' + prNum + '/comments',
      headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      },
      json: {'body': 'Hello internet.'}
  }
  
  request.post(options, function done(error, response, body) {
    if (error) console.log(error)
    // console.log(response)
  })
  
}