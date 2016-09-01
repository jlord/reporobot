var request = require('request')

// When a new invite email is recieved this is
// called and all of the pending invites are accepted
module.exports = function acceptInvites (callback) {
  var options = {
      url: 'https://api.github.com/user/repository_invitations',
      json: true,
      headers: { 'User-Agent': 'request',
                 'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      }
  }

  acceptBatch()

  function acceptBatch () {
    request(options, function gotInvites (err, response, body) {
      var inviteCount = 0
      var acceptedCount = 0

      if (err) return callback(err)
      if (!err && response.statusCode == 200) {
        // Return if there are no pending invites
        inviteCount = body.lenth
        if (inviteCount === 0) return callback()
        console.log(new Date(), 'Accepting', body.length, 'invites')
        body.forEach(function getID (invite) {
          // Accept each invite
          options.url = 'https://api.github.com/user/repository_invitations/' + inviteID
          request.patch(options, function approved (err, response, body) {
            if (err) return callback(err)
            console.log(new Date(), 'Invite', body.repository.owner.login, body.id, response.statusCode)
            acceptedCount++
            // Once you've accepted 30, the batch max, try again
            // to see if there are more, else you're done!
            if (acceptedCount === 30) return acceptBatch()
            if (acceptedCount === inviteCount) return callback()
          })
        })
      }
    })
  }
}
