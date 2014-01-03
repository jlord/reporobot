var concat = require('concat-stream')
var http = require('http');

module.exports = function() {
  var server = http.createServer(handler)

  function handler(req, res) {
    console.log(req.url)
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
      console.log('hook buff', buff.length)
      var hookObj = JSON.parse(buff)
      console.log(hookObj)
    }))
  };

  return server
}
