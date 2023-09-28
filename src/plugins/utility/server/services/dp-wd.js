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
    const type = args?.type

    const defaultFilters = {
      type,
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

    const txnRecords = await strapi.entityService.findMany(
      'api::transaction-record.transaction-record',
      {
        fields: ['amount'],
        filters,
      }
    )

    const total = txnRecords.reduce((acc, cur) => {
      return Number(acc) + Number(cur.amount)
    }, 0)

    return Number(total)
  },
  async getDeposit(args) {
    const total = await strapi.service('plugin::utility.dpWd').get({
      ...args,
      type: 'DEPOSIT',
    })
    return Number(total)
  },
  async getWithDraw(args) {
    const total = await strapi.service('plugin::utility.dpWd').get({
      ...args,
      type: 'WITHDRAW',
    })

    return Number(total)
  },
  async getDpWd(args) {
    const depositTotal = await strapi
      .service('plugin::utility.dpWd')
      .getDeposit(args)
    const withdrawTotal = await strapi
      .service('plugin::utility.dpWd')
      .getWithDraw(args)

    return Number(depositTotal) - Number(withdrawTotal)
  },
})
