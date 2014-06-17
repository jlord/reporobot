#!/usr/bin/env node

var pr = require(__dirname + '/test-onbehalfof.js')
var runParallel = require('run-parallel')

var accounts = ['jllord']
// var accounts = ['goldenrod', 'maxogden', 'jllord', 'eviljlord']
var sourceAccount = 'jlord'

accounts.forEach(function(account) {
  pr(sourceAccount, account)
})
