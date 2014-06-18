#!/usr/bin/env node

var pr = require(__dirname + '/test-onbehalfof.js')
var runParallel = require('run-parallel')

var accounts = ['jllord']
// var accounts = ['goldenrod', 'maxogden', 'jllord', 'eviljlord']
var sourceAccount = 'jlord'
var n = 0
accounts.forEach(function(account) {
  n++
  console.log("Running for " + account)
  pr(sourceAccount, account, n)
})
