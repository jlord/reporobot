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
      stats.time = info.created_at.toLocaleString()
      // RR is PRing on behalf of:
      stats.username = info.head.user.login
      console.log(new Date(), "PR " ,  stats.prNum , "Reporobot Pull Request on behalf of " , stats.username)
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
        if (body.length > 1) {
          console.log(new Date(), "PR " , stats.prNum , "MORE THAN ONE FILE " , stats.username)
          var message = 'Uh oh, I see too many files, there should be one.\n1. Delete the extra file on your computer.\n2. Add and commit that change with `git add -A && git commit -m "delete extra file"\n3. Then push those changes\n 4. Check back here to see if it merged.'
          return writeComment(message, stats.prNum)
        }

        var prInfo = body[0]

        if (prInfo === undefined ) {
          console.log(new Date(), "PR " , stats.prNum , "FILE IS EMPTY " , stats.username)
          var message = "File is empty, try again!"
          return writeComment(message, stats.prNum)
        }

        return verifyFilename(prInfo)
      }

      callback(body)
    })
  }

  function verifyFilename(prInfo) {
    var filename = prInfo.filename.toLowerCase()
    if (filename.match('contributors/add-' + stats.username.toLowerCase() + '.txt')) {
      console.log(new Date(), "PR " , stats.prNum , "Filename: MATCH " , stats.username)
      return verifyContent(prInfo)
    }
    else {
      var message = 'Filename is different than expected: contributors/add-' + stats.username + '.txt. Close the pull request, rename your file and try again!'
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
        console.log(new Date(), "PR " , stats.prNum , "Content: MATCH " , stats.username)
        return setTimeout(mergePR(stats.prNum), 5000)
      }
      else {
        var message = "Ascii art wasn't as expected, did something change? Close and re-open please."
        return writeComment(message, stats.prNum)
      }
    })
  }

  function writeComment(message, prNum) {
    console.log(new Date(), "PR " +  prNum + "Uh oh, writing comment for " + stats.username)
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
    var tries = 0
    var limit = 25
    tryMerge()
    function tryMerge() {
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
          if (response.statusCode != 200) {
            console.log(new Date(), prNum, "ERROR MERGING", response.statusCode, body.message)
            console.log(new Date(), prNum, "TRYING AGAIN")
            if (tries <= limit) {
              tries++
              return setTimeout(tryMerge(prNum), 3000)
            } else {
              callback(null, new Date() + "Could not merge after " + limit + " tries " + prNum)
            }
          }
          if (!error && response.statusCode == 200) {
            console.log(new Date(), "PR " , prNum , "MERGED" , stats.username)
            // add contributor to file and then rebuild page
            return addContributor(stats, callback)
          } else {
           callback(error, body)
          }
        })
      }
    }
}
