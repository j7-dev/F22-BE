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
  })
)
