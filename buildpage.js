#!/usr/bin/env node

var hbs = require('handlebars')
var fs = require('fs')
var Github = require('github-api')

module.exports = function() {
  fs.readFile('contributors.json', function (err, data) {
    if (err) console.log(err)
    var everyone = JSON.parse(data)
    var stats = {featured: everyone[0], everyone: everyone}
    getTemplate(stats)
  })

  function getTemplate(stats) {
    fs.readFile('template.hbs', function (err, data) {
      if (err) console.log(err)
      data = data.toString()
      var template = hbs.compile(data)
      var HTML = template(stats)
      console.log(HTML)
      // writeRepo(HTML, stats)
    })
  }

  function writeRepo(HTML, stats) {
    console.log("PAge stats", stats)
    var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
    })
    var repo = github.getRepo('jlord', 'patchwork')
    var username = stats.featured.username
  
    var commitMes = "rebuilt with @" + username + " added\!"
    repo.write('gh-pages', 'index.html', HTML, commitMes, function(err) {
      console.log("REBUILT INDEX")
    })
  }
}