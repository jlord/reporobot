var request = require('request')
var asciify = require('asciify')
var fs = require('fs')

var addContributor = require('./contributors.js')

var baseURL = 'https://api.github.com/repos/jlord/patchwork/'
var stats = {}

module.exports = function(pullreq, callback) {
  if (pullreq.pull_request) pullreq = pullreq.pull_request
  // if branch name doesn't include username, it may be
  // a non git-it related, normal PR
  if (!pullreq.head.ref.toLowerCase().match(pullreq.user.login.toLowerCase()) && pullreq.user.login != "reporobot") 
    return callback(new Error("Id\'d via branch to not be a Git-it submission or test"))
  
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
    // if a test pr is coming in
    if (!error && response.statusCode == 200 && pullreq.user.login === "reporobot") {
      var info = body
      stats.time = info.created_at
      // RR is PRing on behalf of:
      stats.username = info.head.user.login
      console.log([new Date(), "Reporobot Pull Request on behalf of " + stats.username])
      return getFile(stats.prNum) 
    }
    
    if (!error && response.statusCode == 200 && pullreq.user.login != "reporobot") {
      var info = body
      stats.time = info.created_at
      stats.username = info.user.login
      return getFile(stats.prNum)
    }  
    
    callback(body)
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
      if (error || body.length === 0) return callback(error, "Error finding file in PR")
      
      if (!error && response.statusCode == 200) {
        var prInfo = body[0]
        return verifyFilename(prInfo)
      }
      
      callback(body)
    })
  }
  
  function verifyFilename(prInfo) {
    var filename = prInfo.filename
    if (filename.match('contributors/add-' + stats.username + '.txt')) {
      console.log([ new Date(), "Filename: MATCH " + stats.username])
      return verifyContent(prInfo)
    }
    else {
      var message = 'Filename is different than expected: contributors/add-' + stats.username + '.txt'
      return writeComment(message, stats.prNum)
    }
  }

  function verifyContent(prInfo) {
    // pull out the actual pr content
    var patchArray = prInfo.patch.split('@@')
    var patch = patchArray.pop()
    // generate the expected content
    asciify(stats.username, {font:'isometric2'}, function(err, res){
      if (err) return callback(err, "Error generating ascii art to test against")
      console.log(patch)
      console.log(res)
      if (patch !== stats.username) {
        stats.userArt = res
        console.log([new Date(), " Content: MATCH " + stats.username])
        return mergePR(stats.prNum)
      }
      else {
        var message = "Ascii art wasn't as expected, did something change?"
        return writeComment(message, stats.prNum)
      }
    })
  }

  function writeComment(message, prNum) {
    console.log([new Date(), "Uh oh, writing comment for " + stats.username])
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
      callback()
    })
  }
  
  function mergePR(prNum) {
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
         console.log([new Date(), "MERGED " + stats.username + " pull request" ])
         // add contributor to file and then rebuild page
         return addContributor(stats, callback)
     } else {
       callback(error, body)
     }
   })
  }
  
}



