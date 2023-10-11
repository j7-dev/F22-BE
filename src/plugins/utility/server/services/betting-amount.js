'use strict'
const { removeUndefinedKeys } = require('./utils')
const round = require('lodash/round')

// 有效投注 amount_type = 'CASH'
// 一班投注 amount_type = any

module.exports = ({ strapi }) => ({
  async get(args) {
    const start = args?.start
    const end = args?.end
    const user_id = args?.user_id
    const amount_type = args?.amount_type
    const currency = args?.currency
    const betResult = args?.type
    const type = args?.type

    const defaultFilters = {
      type: type ? type : 'CREDIT',
      status: 'SUCCESS',
      amount: {
        $gt: betResult === 'WIN' ? 0 : undefined,
        $lt: betResult === 'LOSS' ? 0 : undefined,
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

    const total = winRecords.reduce((acc, cur) => {
      return Number(acc) + Number(cur.amount)
    }, 0)

    return total
  },
  //取贏
  async getWin(args) {
    const totalWin = await strapi.service('plugin::utility.bettingAmount').get({
      ...args,
      type: 'CREDIT',
      betResult: 'WIN',
    })
    return totalWin
  },

  // 取輸
  async getLoss(args) {
    const totalLoss = await strapi
      .service('plugin::utility.bettingAmount')
      .get({
        ...args,
        type: 'CREDIT',
        betResult: 'LOSS',
      })

    return Math.abs(totalLoss)
  },

  // 取得入金
  async getDebit(args) {
    const total = await strapi.service('plugin::utility.bettingAmount').get({
      ...args,
      type: 'DEBIT',
    })

    return Math.abs(total)
  },
  // 取得贏虧
  async getWinLoss(args) {
    const totalWin = await strapi
      .service('plugin::utility.bettingAmount')
      .getWin(args)

    const totalLoss = await strapi
      .service('plugin::utility.bettingAmount')
      .getLoss(args)

    const winLoss = totalWin - totalLoss

    return winLoss
  },
  // 取得贏虧比
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
