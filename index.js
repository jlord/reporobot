var hook = require('hubhook')();
var http = require('http');

module.exports = function() {
  var server = http.createServer(handler)

  function handler(req, res) {
    console.log(req.url)
    if (req.method === 'POST' && req.url === '/push') {
      return hook.handle(req, res);
    }
    res.statusCode = 404;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      error: 404,
      message: 'not_found',
      hints: 'POST to /push'
    }, true, 2));
  }

  hook.on('payload', function (payload) {
    console.log(payload);
  });
  return server
}
