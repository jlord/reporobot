var concat = require('concat-stream')
var http = require('http')
var fs = require('fs')
var url = require('url')

var prStatus = require('./prcheck.js')
var collabStatus = require('./collabcheck.js')
var handlePr = require('./merge.js')

module.exports = function(onHook) {
  var server = http.createServer(handler)

  function handler(req, res) {
    console.log(req.method, req.url)
    if (req.url === '/push') {
      return handleHook(req, res)
    }

    if (req.url.match('/pr')) {
      var queryURL = url.parse(req.url, true)
      var username = queryURL.query.username
      return prStatus(username, function(err, pr) {
        checkPR(res, err, pr)
      })
    }
    
    if (req.url.match('/orderin')) {
      return getPR(req, res)
    }

    if (req.url.match('/collab')) {
      var queryURL = url.parse(req.url, true)
      var username = queryURL.query.username
      return collabStatus(username, function(err, collab) {
        checkCollab(res, err, collab)
      })
    }

    res.statusCode = 404
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      error: 404,
      message: 'not_found',
      hints: 'POST to /push'
    }, true, 2))
  }

  function handleHook(req, res) {
    req.pipe(concat(function(buff) {
      var hookObj = JSON.parse(buff)
      if (onHook) onHook(hookObj, req)
    }))
  }
  
  function getPR(req, res) {
    req.pipe(concat(function(buff) {
      var pullreq = JSON.parse(buff)
      handlePr(pullreq, req)
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end()
    }))
  }

  function checkPR(res, err, pr) {
    if (err) console.log(err)
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      error: 200,
      pr: pr
    }, true, 2))
  }

  function checkCollab(res, err, collab) {
    if (err) console.log(err)
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      error: 200,
      collab: collab
    }, true, 2))
  }
  
  function mergedPr(res, err) {
    if (err) console.log(err)
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      error: 200,
    }, true, 2))
  }

  return server
}
