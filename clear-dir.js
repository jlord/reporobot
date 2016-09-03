var request = require('request')

// /GET /repos/:owner/:repo/contents/:path

// DELETE /repos/:owner/:repo/contents/:path

var options = {
    url: 'https://api.github.com/repos/jlord/patchwork/contents/contributors',
    json: true,
    headers: { 'User-Agent': 'request',
               'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
    }
}

request(options, function (err, response, body) {
  if (err) return console.log(err)
  console.log(body)
  console.log(body.length)
})
