'use strict'

/**
 * token-transaction controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::token-transaction.token-transaction',
  ({ strapi }) => ({
    async create(ctx) {
      const body = ctx.request.body?.data

      // 如果沒有帶參數就回 400
      const requiredFields = [
        'uid',
        'transaction_id',
        'gRound',
        'gtype',
        'user_id',
        'agent_id',
        'transaction_type',
        'amount',
        'currency',
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
      const requiredFields = ['user_id', 'transaction_id']

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
            transaction_id: query.transaction_id,
          },
          populate: ['user_id'],
          sort: { createdAt: 'desc' },
        }
      )

      const formattedTransactions = transactions.map((transaction) => ({
        user_id: transaction?.user_id?.id,
        currency: transaction?.currency,
        amount: transaction?.amount,
        transaction_id: transaction?.transaction_id,
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
