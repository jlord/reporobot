var concat = require('concat-stream')
var http = require('http')
var fs = require('fs')
var url = require('url')

var prStatus = require('./prcheck.js')
var collab = require('./collab.js')

module.exports = function(onHook) {
  var server = http.createServer(handler)

  function handler(req, res) {
    console.log(req.method, req.url)
    if (req.method === 'POST' && req.url === '/push') {
      return handleHook(req, res)
    }

    if (req.method === 'POST' && req.url.match('/pr')) {
      var queryURL = url.parse(req.url, true)
      var username = queryURL.query.username
      return prStatus(function(err, issues) {
        checkPR(res, err, issues)
      })
    }

    if (req.method === 'POST' && req.url.match('/collab')) {
      var queryURL = url.parse(req.url, true)
      var username = queryURL.query.username
      return collab(username, function(err, issues) {
        checkCollab(res, err, userRepos)
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

  function checkPR(res, err, pr) {
    if (err) console.log(err)
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      error: 200,
      pr: pr
    }, true, 2))
  }

  function checkCollab(res, err, userRepos) {
    if (err) console.log(err)
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      error: 200
    }, true, 2))
  }

  return server
}
