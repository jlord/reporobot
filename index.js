var concat = require('concat-stream')
var http = require('http')
var fs = require('fs')
var url = require('url')
var async = require('async')


var prStatus = require('./prcheck.js')
var collabStatus = require('./collabcheck.js')
var mergePr = require('./merge.js')

var q = async.queue(function (pullreq, callback) {
  console.log("QUEUE", pullreq.number)
  mergePr(pullreq, function(err, message) {
    if (err) console.log([new Date(), message, err])
    setTimeout(function() { callback(err) }, 3000)
  })
}, 1)

q.drain = function() { console.log("Queue drain")}

module.exports = function(onHook) {
  
  var server = http.createServer(handler)

  function handler(req, res) {
    console.log([new Date(), req.method, req.url])
    
    // when RR gets a push from email on collab
    if (req.url === '/push') {
      return handleEmail(req, res)
    }
    
    // when a pr is made to patchwork repo  
    if (req.url.match('/orderin')) {
      return getPR(req, res)
    }
    
    // when git-it verifies user made a pr
    if (req.url.match('/pr')) {
      var queryURL = url.parse(req.url, true)
      var username = queryURL.query.username
      return prStatus(username, function(err, pr) {
        checkPR(res, err, pr)
      })
    }

    // when git-it verifies user added RR as collab
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
        if (err) console.log([new Date(), message, err])
      })
    }))
    
    res.statusCode = 200
    res.end("Thank you.")
  }
  
  function getPR(req, res) {
    req.pipe(concat(function(buff) {
      var pullreq = JSON.parse(buff)
      
      // make sure not closed or non-workshop PR
      if (pullreq.action && pullreq.action === "closed") {
        console.log("SKIPPING: CLOSED PULL REQUEST")
      } 
      else {
        q.push(pullreq, function(err, message) {
          if (err) console.log([new Date(), message, err])
          console.log([new Date(), message, "Finished PR " + pullreq.number])
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
    // res.setHeader('content-type', 'application/json')
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
