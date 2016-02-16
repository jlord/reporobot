var rebuildpage = require('./buildpage.js')

rebuildpage(function done(error, message, body){
  if (error) return console.log(error, message)
  console.log(error, message, body)
  console.log("Finished rebuilding page.")
})
