// on new PR ->
// verify pr content matches username
// merge
// on merge ->
// rewrite index.html template
// push
// new gh-pages is launched

var request = require('request');

module.exports = function(pullreq, req) {
  var prNum = pullreq.number
  
  request(options, callback)
  
  var options = {
      url: 'https://api.github.com/repos/jlord/patchwork/pulls/' + prNum,
      headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      }
  }
  
  function callback(error, response, body) {
    if (error) console.log(error)
      if (!error && response.statusCode == 200) {
          var info = JSON.parse(body);
      }
  }
  
  
}