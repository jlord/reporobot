// After Reporobot does everything with a sucessful user, it deltes the file
// they added because turns out lots of people are doing this and the repo
// gets bulky quickly. This file is called from buildpage.js

var request = require('request')

var baseURL = 'https://api.github.com/repos/jlord/patchwork/contents/contributors'
var headers = {
  'User-Agent': 'request',
  'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
}

module.exports = function deleteFile (username, callback) {
  var options = {
    url: baseURL,
    json: true,
    headers: headers
  }
  // First get info on the file
  request(options, function (err, response, body) {
    if (err) return callback(err, 'Did not get file info')
    console.log('Files in contributors: ' + body.length)
    body.forEach(function (file) {
      // leave add-jlord.txt there as a sample file
      if (file.path.match('add-jlord.txt')) return
      else deleteFile(file)
    })
  })

  function deleteFile (file) {
    var options = {
      url: baseURL + '/' + file.name,
      json: true,
      headers: headers,
      body: {
        'message': 'Clearing directory',
        'committer': {
          'name': 'reporobot',
          'email': '60ebe73fdad8ee59d45c@cloudmailin.net'
        },
        'sha': file.sha,
        'path': file.path
      }
    }
    request.del(options, function (err, response, body) {
      if (err) return callback(err, 'Error with delete request')
      if (response.statusCode != 200) return callback(new Error(), 'Did not delete file: ' + response.statusCode)
      console.log(new Date(), 'Deleted ' + file.name)
      callback(null)
    })
  }
}
