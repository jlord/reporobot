#!/usr/bin/env node

var pr = require('./tests/test-onbehalfof.js')
var accounts = ['jllord', 'goldenrod']
var sourceAccount = 'jlord'

accounts.forEach(function (account) {
  pr(sourceAccount, account)
})