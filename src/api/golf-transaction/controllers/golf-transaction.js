'use strict'

/**
 * golf-transaction controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::golf-transaction.golf-transaction',
  ({ strapi }) => ({
    async create(ctx) {
      const body = ctx.request.body?.data

      // 如果沒有帶參數就回 400
      const requiredFields = [
        'user_id',
        'login_id',
        'bet_id',
        'currency',
        'amount',
        'transaction_type',
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
