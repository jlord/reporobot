var concat = require('concat-stream')
var http = require('http')
var fs = require('fs')
var prStatus = require('./prcheck.js')

// var prStatus = require('./prcheck.js')

module.exports = function(onHook) {
  var server = http.createServer(handler)

  function handler(req, res) {
    console.log(req.method, req.url)
    if (req.method === 'POST' && req.url === '/push') {
      return handleHook(req, res)
    }

    if (req.method === 'POST' && req.url === '/pr') {
      return prStatus(function(err, issues) {
        checkPR(res, err, issues)
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
      // fs.writeFileSync('email.json', JSON.stringify(hookObj))
      if (onHook) onHook(hookObj, req)
    }))
  }

  function checkPR(res, err, issues) {
    if (err) console.log(err)
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      error: 200,
      issuesCount: issues.length
    }, true, 2))
    console.log("i did it!", issues.length)
  }

  return server
}
