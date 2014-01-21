var fs = require('fs')
var file = 'contributors.json'

module.exports = function(stats, callback) {
  
  fs.readFile(file, function (err, data) {
    if (err) console.log(err)
    
    var oldData = data.toString()
    
    if (oldData === "") var array = []
    else var array = JSON.parse(oldData)
    
    array.push(stats)
    fs.writeFile(file, JSON.stringify(array), function(err) {
      if (err) return console.error('error writing array', err)
      var lastUser = array[array.length - 1]
      if (lastUser) console.log([new Date(), "Added user " + lastUser + " to contributors.json"])
      else console.log('no last user')
      callback()
    })
  })
}
