#!/usr/bin/env node

var hbs = require('handlebars')
var fs = require('fs')

  // get data
  console.log("getting things")
  fs.readFile('contributors.json', function (err, data) {
    if (err) console.log(err)
    var everyone = JSON.parse(data)
    var stats = {featured: everyone[0], everyone: everyone}
    console.log(stats)
    getTemplate(stats)
  })

  function getTemplate(stats) {
    fs.readFile('template.hbs', function (err, data) {
      if (err) console.log(err)
      data = data.toString()
      var template = hbs.compile(data)
      var HTML = template(stats)
      console.log("HTLM", HTML)
    })
  }
  
 