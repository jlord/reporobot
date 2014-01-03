var concat = require('concat-stream')
var http = require('http');
var fs = require('fs')

module.exports = function(onHook) {
  var server = http.createServer(handler)

  function handler(req, res) {
    console.log(req.method, req.url)
    if (req.method === 'POST' && req.url === '/push') {
      return handleHook(req, res);
    }
    res.statusCode = 404;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      error: 404,
      message: 'not_found',
      hints: 'POST to /push'
    }, true, 2));
  }

  function handleHook(req, res) {
    req.pipe(concat(function(buff) {
      var hookObj = JSON.parse(buff)
      if (onHook) onHook(hookObj.forkee.name)
      // fs.writeFileSync('data.json', JSON.stringify(hookObj)) // on server
    }))
  };

  return server
}
