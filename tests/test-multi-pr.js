#!/usr/bin/env node

var pr = require(__dirname + '/test-onbehalfof.js')
var runParallel = require('run-parallel')

var accounts = ['goldenrod']
var sourceAccount = 'jlord'

var functionsToDo = accounts.map(function(account) {
    return function(cb) {
      pr(sourceAccount, account)
    }
  })

runParallel(functionsToDo, function(err) {
  console.log("Done with all")
})
