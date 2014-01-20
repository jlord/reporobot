var fs = require('fs')
var file = 'contributors.json'

module.exports = function(stats, callback) {
  console.log("these are the stats", stats)
  
  fs.readFile(file, function (err, data) {
    if (err) console.log(err)
    
    var oldData = data.toString()
    
    if (oldData === "") var array = []
    else var array = JSON.parse(oldData)
    
    array.push(stats)
    console.log(["array of all contribs before writing file", array])
    fs.writeFile(file, JSON.stringify(array), function(err) {
      if (err) return console.error('error writing array', err)
      var lastUser = array[array.length - 1]
      if (lastUser) console.log(lastUser.username)
      else console.log('no last user')
      callback()
    })
  })
}
