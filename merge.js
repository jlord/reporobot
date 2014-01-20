var request = require('request')
var asciify = require('asciify')
var fs = require('fs')

var addContributor = require('./contributors.js')
var buildPage = require('./buildpage.js')

var baseURL = 'https://api.github.com/repos/jlord/patchwork/'
var stats = {}

// what happens when multiple people are doing this?!

module.exports = function(pullreq, req) {
  if (pullreq.action && pullreq.action === "closed") return
  if (pullreq.pull_request) pullreq = pullreq.pull_request
  
  stats.prNum = pullreq.number
  
  
  // make sure it's not a non-workshop, normal PR
  if (pullreq.base.ref.match(pullreq.user.login)) return

  var options = {
      url: baseURL +'pulls/' + stats.prNum,
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
      if (error) console.log(error)
      
        if (!error && response.statusCode == 200) {
          var prInfo = body[0]
          verifyFilename(prInfo)
        }
    })
  }
}

function verifyFilename(prInfo) {
  // add /contributors/ to filename
  var filename = prInfo.filename
  console.log(["filename from PR", filename])
  // if (filename.match('/contributors/test.md')) {
  if (filename.match('contributors/add-' + stats.username + '.md')) {
    console.log("Filename: MATCH")
    verifyContent(prInfo)
  }
  else {
    var message = 'Filename is different than expected: contributors/add-' + stats.username 
    writeComment(message, stats.prNum)
  }
}

function verifyContent(prInfo) {
  // pull out the actual pr content
  var patchArray = prInfo.patch.split('@@')
  var patch = patchArray.pop()
  // generate the expected content
  asciify(stats.username, {font:'isometric2'}, function(err, res){ 
    if (err) console.log(err)
    if (res.match(patch)) {
      stats.userArt = res
      console.log("Content: MATCH")
      mergePR(stats.prNum)
    }
    else {
      var message = "Ascii art wasn't as expected, did something change?"
      writeComment(message, stats.prNum)
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
 
 request.put(options, function done(error, response, body) {
   if (error) console.log(error)
   if (!error && response.statusCode == 200) {
       console.log("MERGED")
       // add contributor to file and rebuild page
       addContributor(stats, buildPage)
   }
 })
}