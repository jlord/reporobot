// After Reporobot does everything with a sucessful user, it deltes the file
// they added because turns out lots of people are doing this and the repo
// gets bulky quickly

var request = require('request')

var baseURL = 'https://api.github.com/repos/jlord/patchwork/contents/contributors'
var headers = {
  'User-Agent': 'request',
  'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
}

module.exports = function deleteFile (callback) {
  // We could take in username here and delete the specific just-merged-file,
  // but we might be ok just deleting the last file.
  var options = {
    url: baseURL,
    json: true,
    headers: headers
  }
  // First get info on the file
  request(options, function (err, response, body) {
    if (err) return callback(err, 'Did not get file info')
    deleteFile(body[0])
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
      if (err) return callback(err, 'Did not delete file')
      console.log(new Date(), 'Deleted' + file.name)
      callback(null)
    })
  }
}
