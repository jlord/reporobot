var fs = require('fs')
var file = 'contributors.json'

module.exports = function(stats, callback) {
  fs.readFile(file, function (err, data) {
    if (err) throw err
    data = data.toString()
    
    if (data === "") var array = []
    else var array = JSON.parse(data)
    
    array.push(stats)
    writeFile(file, JSON.stringify(array), callback)
  })
}

function writeFile(file, array, callback) {
  fs.writeFile(file, array, function (err) {
    if (err) throw err
    callback()
  }) 
}
