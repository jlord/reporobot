var concat = require('concat-stream')
var http = require('http')
var fs = require('fs')
var url = require('url')
var async = require('async')


var prStatus = require('./prcheck.js')
var collabStatus = require('./collabcheck.js')
var mergePr = require('./merge.js')

// q to slow it down enough for the GitHub API
var q = async.queue(function (pullreq, callback) {
  console.log(new Date(), "QUEUE", pullreq.number)
  mergePR(pullreq, function(err, message) {
    if (err) console.log(new Date(), message, err)
    // setTimeout(function() { callback(err) }, 1000)
    // what is this cb doing with err
    callback(err)
  })
}, 1)

q.drain = function() {console.log("Queue drain")}

module.exports = function(onHook) {

  var server = http.createServer(handler)

  // handler routes the requests to RR
  // to the appropriate places
  function handler(req, res) {
    console.log(">>>>>", new Date(), req.method, req.url)

    // When RR gets a push from email when added as collab
    // Email from GitHub -> cloudmail.in -> here
    if (req.url === '/push') {
      return handleEmail(req, res)
    }

    // When a PR is made to patchwork repo
    // Comes from a GitHub webhook Patchwork repo
    if (req.url.match('/orderin')) {
      return getPR(req, res)
    }

    // When Git-it verifies user made a PR
    // Comes from verify step in Git-it challenge #10
    if (req.url.match('/pr')) {
      var queryURL = url.parse(req.url, true)
      var username = queryURL.query.username
      return prStatus(username, function(err, pr) {
        checkPR(res, err, pr)
      })
    }

    // when git-it verifies user added RR as collab
    // When Git-it verifies user added RR as collab
    if (req.url.match('/collab')) {
      var queryURL = url.parse(req.url, true)
      var username = queryURL.query.username
      return collabStatus(username, function(err, collab) {
        checkCollab(res, err, collab)
      })
    }

  // when anything else goes to reporobot.jlord.us
  res.statusCode = 404
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify({
    error: 404,
    message: 'not_found'
  }, true, 2))
}

  function handleEmail(req, res) {
    req.pipe(concat(function(buff) {
      var emailObj = JSON.parse(buff)

      if (onHook) onHook(emailObj, function(err, message) {
        if (err) console.log(new Date(), message, err)
      })
    }))

    res.statusCode = 200
    res.end("Thank you.")
  }

  function getPR(req, res) {
    req.pipe(concat(function(buff) {
      var pullreq = JSON.parse(buff)

      // Check if it's a closed PR
      if (pullreq.action && pullreq.action === "closed") {
        console.log("SKIPPING: CLOSED PULL REQUEST")
      }
      else {
        q.push(pullreq, function(err, message) {
          if (err) console.log(new Date(), message, err)
          console.log(new Date(), pullreq.number, message, "Finished PR" )
        })
      }

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end()
    }))
  }

  function checkPR(res, err, pr) {
    if (err) {
      console.log(err)
      res.statusCode = 500
      res.end(JSON.stringify({error: err}))
      return
    }
    res.statusCode = 200
    res.end(JSON.stringify({
      pr: pr
    }, true, 2))
  }

  function checkCollab(res, err, collab) {
    if (err) {
      console.log(err)
      res.statusCode = 500
      res.end(JSON.stringify({error: err}))
      return
    }
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      collab: collab
    }, true, 2))
  }

  // does this ever get called?
  function mergedPr(res, err) {
    if (err) {
      console.log(err)
      res.statusCode = 500
      res.end(JSON.stringify({error: err}))
      return
    }
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      merged: true,
    }, true, 2))
  }

  return server
}
