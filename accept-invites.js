var request = require('request')

var options = {
    url: 'https://api.github.com/user/repository_invitations',
    json: true,
    headers: { 'User-Agent': 'request',
               'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
    }
}

get30Invites()

function get30Invites () {
  request(options, function getInvites (error, response, body) {
    if (error) return console.log(error)
    console.log(response.statusCode)
    if (!error && response.statusCode == 200) {
      console.log(body.length, 'invites')
      body.forEach(function getID (invite) {
        approveInvite(invite.id)
      })
    }
  })
}



function approveInvite (inviteID) {
  options.url = 'https://api.github.com/user/repository_invitations/' + inviteID
  request.patch(options, function approved (error, response, body) {
    if (error) return console.log(error)
    console.log('invite', inviteID, response.statusCode)
  })
}
