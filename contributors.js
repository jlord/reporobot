var fs = require('fs')

module.exports = function(stats, callback) {
  fs.appendFile('contributors.json', stats, function (err) {
    if (err) throw err
    console.log('Added ' + stats.username + 'to the contributors!')
    callback()
  })
}