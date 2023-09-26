'use strict'
const { removeUndefinedKeys } = require('./utils')
const round = require('lodash/round')

// 有效投注 amount_type = 'CASH'
// 一班投注 amount_type = any

module.exports = ({ strapi }) => ({
  async getWin(args) {
    const start = args?.start
    const end = args?.end
    const user_id = args?.user_id
    const amount_type = args?.amount_type
    const currency = args?.currency

    const defaultFilters = {
      type: 'BET',
      status: 'SUCCESS',
      amount: {
        $gt: 0,
      },
      user: user_id,
      currency,
      amount_type,
      createdAt: {
        $gt: start,
        $lt: end,
      },
    }

    const filters = removeUndefinedKeys(defaultFilters)

    const winRecords = await strapi.entityService.findMany(
      'api::transaction-record.transaction-record',
      {
        fields: ['amount'],
        filters,
      }
    )

    const totalWin = winRecords.reduce((acc, cur) => {
      return Number(acc) + Number(cur.amount)
    }, 0)

    return totalWin
  },
  async getLoss(args) {
    const start = args?.start
    const end = args?.end
    const user_id = args?.user_id
    const amount_type = args?.amount_type
    const currency = args?.currency

    const defaultFilters = {
      type: 'BET',
      status: 'SUCCESS',
      amount: {
        $lt: 0,
      },
      user: user_id,
      currency,
      amount_type,
      createdAt: {
        $gt: start,
        $lt: end,
      },
    }

    const filters = removeUndefinedKeys(defaultFilters)

    const winRecords = await strapi.entityService.findMany(
      'api::transaction-record.transaction-record',
      {
        fields: ['amount'],
        filters,
      }
    )

    const totalWin = winRecords.reduce((acc, cur) => {
      return Number(acc) + Number(cur.amount)
    }, 0)

    return Math.abs(totalWin)
  },
  async getWinLossRatio(args) {
    const totalWin = await strapi
      .service('plugin::utility.bettingAmount')
      .getWin(args)

    const totalLoss = await strapi
      .service('plugin::utility.bettingAmount')
      .getLoss(args)

    const winLossRatio = totalLoss ? round(totalWin / totalLoss, 2) : 'N/A'

    return winLossRatio
  },
})
