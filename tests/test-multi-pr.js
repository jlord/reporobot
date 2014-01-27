#!/usr/bin/env node

var pr = require(__dirname + '/testonbehalfof.js')
var accounts = ['jllord', 'goldenrod']
var sourceAccount = 'jlord'

accounts.forEach(function (account) {
  console.log("Sending " + account + " on..")
  setTimeout(pr(sourceAccount, account), 3000)
})