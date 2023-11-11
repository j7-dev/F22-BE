'use strict'

const bettingAmount = require('./betting-amount')
const bettingRecords = require('./betting-records')
const statistic = require('./statistic')
const helper = require('./helper')
const dpWd = require('./dp-wd')
const users = require('./users')

module.exports = {
  bettingRecords,
  bettingAmount,
  statistic,
  dpWd,
  helper,
  users,
}
