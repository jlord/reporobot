var request = require('request')
var asciify = require('asciify')
var fs = require('fs')

var addContributor = require('./contributors.js')

var baseURL = 'https://api.github.com/repos/jlord/patchwork/'
var stats = {}

module.exports = function(pullreq, callback) {
  // make sure not closed or non-workshop PR
  if (pullreq.action && pullreq.action === "closed") return
  if (!pullreq.head.ref.match(pullreq.user.login)) return
  // weird case
  if (pullreq.pull_request) pullreq = pullreq.pull_request
  
  stats.prNum = pullreq.number

  var options = {
      url: baseURL +'pulls/' + stats.prNum,
      json: true,
      headers: { 'User-Agent': 'request',
                 'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
        }
  }
  
  function getTime(error, response, body) {
    if (error) return callback(error, "Error in request on PR via number")
    
    if (!error && response.statusCode == 200) {
      var info = body
      stats.time = info.created_at
      stats.username = info.user.login
      getFile(stats.prNum)
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
      if (error) return callback(error, "Error getting file from PR")
      
      if (!error && response.statusCode == 200) {
        var prInfo = body[0]
        verifyFilename(prInfo)
      }
    })
  }
}

function verifyFilename(prInfo) {
  var filename = prInfo.filename
  if (filename.match('contributors/add-' + stats.username + '.txt')) {
    console.log([ new Date(), "Filename: MATCH" + stats.username])
    verifyContent(prInfo)
  }
  else {
    var message = 'Filename is different than expected: contributors/add-' + stats.username + '.txt'
    writeComment(message, stats.prNum)
  }
}

function verifyContent(prInfo) {
  // pull out the actual pr content
  var patchArray = prInfo.patch.split('@@')
  var patch = patchArray.pop()
  // generate the expected content
  asciify(stats.username, {font:'isometric2'}, function(err, res){ 
    if (err) callback(err, "Error generating ascii art to test against")
    if (res.match(patch)) {
      stats.userArt = res
      console.log([new Date(), " Content: MATCH" + stats.username])
      mergePR(stats.prNum)
    }
    else {
      var message = "Ascii art wasn't as expected, did something change?"
      writeComment(message, stats.prNum)
    }
  })
}

function writeComment(message, prNum) {
  console.log([new Date(), "uh oh, writing comment for " + stats.username])
   var options = {
      url: baseURL + 'issues/' + prNum + '/comments',
      headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      },
      json: {'body': message}
  }
  
  request.post(options, function doneWriteComment(error, response, body) {
    if (error) return callback(error, "Error writing comment on PR")
  })
}

function mergePR(prNum) {
  addContributor(stats, buildPage)
  var message = "Merging PR from @" + stats.username
  var options = {
     url: baseURL + 'pulls/' + prNum + '/merge',
     headers: {
         'User-Agent': 'request',
         'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
     },
     json: {'commit_message': message}
 }
 
 request.put(options, function doneMerge(error, response, body) {
   if (error) return callback(error, "Error merging PR")
   if (!error && response.statusCode == 200) {
       console.log([new Date(), "MERGED" + stats.username + "pull request" ])
       // add contributor to file and then rebuild page
       addContributor(stats, callback)
   }
 })
}