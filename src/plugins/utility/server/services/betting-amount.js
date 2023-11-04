'use strict'
const { removeUndefinedKeys } = require('./utils')
const round = require('lodash/round')

// 有效投注 amount_type = 'CASH'
// 一班投注 amount_type = any

module.exports = ({ strapi }) => ({
  /**
   * 取得交易紀錄
   * @param object args
   * @param string args?.user_id
   * @param string args?.amount_type
   * @param string args?.currency
   * @param string args?.type
   * @param string args?.start
   * @param string args?.end
   * @returns
   */
  async get(args) {
    const start = args?.start
    const end = args?.end
    const user_id = args?.user_id
    const amount_type = args?.amount_type
    const currency = args?.currency
    const type = args?.type

    const defaultFilters = {
      type: type
        ? {
            $in: type,
          }
        : 'CREDIT',
      status: 'SUCCESS',
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
  // FIXME 取贏 duprecated
  async getWin(args) {
    const totalWin = await strapi.service('plugin::utility.bettingAmount').get({
      ...args,
      type: ['CREDIT'],
    })
    return totalWin
  },

  // FIXME 取輸 duprecated
  async getLoss(args) {
    const totalLoss = await strapi
      .service('plugin::utility.bettingAmount')
      .get({
        ...args,
        type: ['CREDIT'],
      })

    return Math.abs(totalLoss)
  },

  // 取得入金
  async getDebit(args) {
    const total = await strapi.service('plugin::utility.bettingAmount').get({
      ...args,
      type: ['DEBIT'],
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
