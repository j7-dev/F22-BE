// @ts-nocheck
'use strict'
const { removeUndefinedKeys } = require('./utils')
const dayjs = require('dayjs')

module.exports = ({ strapi }) => ({
  /**
   *
   * @param args
   * @param args.start: Date ISO String
   * @param args.end: Date ISO String
   * @param args.user_id: string
   * @param args.amount_type?: string
   * @param args.currency?: string
   * @param args.type?: string
   * @returns total: number
   */
  async get(args) {
    const siteSetting = global.appData.siteSetting
    const defaultCurrency = siteSetting?.default_currency
    const defaultAmountType = siteSetting?.default_amount_type || 'CASH'

    const {
      start,
      end = dayjs().endOf('day').toISOString(),
      user_id,
      amount_type = defaultAmountType,
      currency = defaultCurrency,
      type,
    } = args

    const defaultFilters = {
      type,
      status: 'SUCCESS',
      user: user_id,
      currency,
      amount_type,
      createdAt: {
        $lt: end,
      },
    }

    if (start) {
      defaultFilters.createdAt.$gt = start
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
  async getWithdraw(args) {
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
      .getWithdraw(args)

    return Number(depositTotal) - Number(withdrawTotal)
  },
})
