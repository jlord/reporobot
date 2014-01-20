var fs = require('fs')
var file = 'contributors.json'

module.exports = function(stats, callback) {
  
  fs.readFile(file, function (err, data) {
    if (err) console.log(err)
    
    data = data.toString()
    
    if (data === "") var array = []
    else var array = JSON.parse(data)
    
    array.push(stats)
    writeFile(file, JSON.stringify(array, null, " "), callback)
  })
}

function writeFile(file, array, callback) {
  fs.writeFile(file, array, function (err) {
    if (err) console.log(err)
    callback()
  }) 
}
