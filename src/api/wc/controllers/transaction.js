'use strict'

/**
 * token-transaction controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::wc.transaction',
  ({ strapi }) => ({
    async create(ctx) {
      const body = ctx.request.body?.data

      // 如果沒有帶參數就回 400
      const requiredFields = [
        'user_id',
        'txd_id',
        'session_id',
        'currency',
        'amount',
        'transaction_type',
        'game_id',
        'round_id',
        'bonus_type',
        'table_id',
      ]

      for (const field of requiredFields) {
        if (body?.[field] === undefined) {
          return ctx.badRequest(`${field} is required`)
        }
      }

      const response = await super.create(ctx)

      return response
    },
    async get(ctx) {
      const query = ctx.request.query

      // 如果沒有帶參數就回 400
      const requiredFields = ['user_id', 'txd_id']

      for (const field of requiredFields) {
        if (query?.[field] === undefined) {
          return ctx.badRequest(`${field} is required`)
        }
      }

      const transactions = await strapi.entityService.findMany(
        'api::token-transaction.token-transaction',
        {
          filters: {
            user_id: query.user_id,
            txd_id: query.txd_id,
          },
          populate: ['user_id'],
          sort: { createdAt: 'desc' },
        }
      )

      const formattedTransactions = transactions.map((transaction) => ({
        user_id: transaction?.user_id?.id,
        currency: transaction?.currency,
        amount: transaction?.amount,
        txd_id: transaction?.transaction_id,
        transaction_type: transaction?.transaction_type,
      }))

      ctx.body = {
        status: '200',
        message: 'get token transactions success',
        data: formattedTransactions,
      }
    },
  })
)
