// @ts-nocheck
'use strict'
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
   * @returns total: number
   */
  async getDeposit(ctx) {
    const query = ctx.request.query
    const result = await strapi
      .service('plugin::utility.dpWd')
      .getDeposit(query)
    ctx.body = {
      status: '200',
      message: 'get Deposit success',
      data: result,
    }
  },
  async getWithdraw(ctx) {
    const query = ctx.request.query
    const result = await strapi
      .service('plugin::utility.dpWd')
      .getWithdraw(query)
    ctx.body = {
      status: '200',
      message: 'get Withdraw success',
      data: result,
    }
  },
  /**
   *
   * @param args
   * @param args.user_id: string
   * @param args.amount_type?: string
   * @param args.currency?: string
   * @returns
   */
  async getDpWdInfosByUser(ctx) {
    const query = ctx.request.query
    const { user_ids, ...restQuery } = query
    if (!user_ids || !user_ids.length) {
      return ctx.badRequest('user_ids is required')
    }
    const starArr = [
      dayjs().startOf('day').toISOString(),
      dayjs().subtract(30, 'day').startOf('week').toISOString(),
      undefined, // TODO 取得總數據可以優化，用類似 BALANCE 方式去拿!?
    ]

    const allUserResult = await Promise.all(
      user_ids.map(async (user_id) => {
        const newQuery = {
          ...restQuery,
          user_id,
        }

        const dpArr = await Promise.all(
          starArr.map(async (start) => {
            const dp = await strapi.service('plugin::utility.dpWd').getDeposit({
              ...newQuery,
              start,
            })
            return dp
          })
        )

        const wdArr = await Promise.all(
          starArr.map(async (start) => {
            const wd = await strapi
              .service('plugin::utility.dpWd')
              .getWithdraw({
                ...newQuery,
                start,
              })
            return wd * -1 // 轉換為正數
          })
        )

        // get one user latest transaction limit 1
        const txn = await strapi.entityService.findMany(
          'api::transaction-record.transaction-record',
          {
            fields: ['createdAt'],
            filters: {
              user: user_id,
            },
            sort: 'createdAt:desc',
            limit: 1,
          }
        )

        const result = {
          user_id: Number(user_id),
          lastBetTime: txn?.[0]?.createdAt,
          dayDp: dpArr?.[0],
          monthDp: dpArr?.[1],
          totalDp: dpArr?.[2],
          dayWd: wdArr?.[0],
          monthWd: wdArr?.[1],
          totalWd: wdArr?.[2],
        }

        return result
      })
    )

    ctx.body = {
      status: '200',
      message: 'get Deposit success',
      data: allUserResult,
    }
  },
})
