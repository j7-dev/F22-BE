'use strict'

const bettingAmount = require('./betting-amount')
const bettingRecords = require('./betting-records')
const statistic = require('./statistic')
const helper = require('./helper')
const dpWd = require('./dp-wd')

module.exports = {
  bettingRecords,
  bettingAmount,
  statistic,
  dpWd,
  helper,
}
