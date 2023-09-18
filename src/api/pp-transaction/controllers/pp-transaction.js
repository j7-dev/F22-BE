'use strict'

/**
 * pp-transaction controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::pp-transaction.pp-transaction',
  ({ strapi }) => ({
    async create(ctx) {
      const body = ctx.request.body
      // 如果沒有帶參數就回 400
      const requiredFields = [
        'user_id',
        'amount',
        'currency',
        'reference',
        'timestamp',
        'transaction_id',
        'transaction_type',
      ]

      for (const field of requiredFields) {
        if (body.data[field] === undefined) {
          return ctx.badRequest(`${field} is required`)
        }
      }

      const response = await super.create(ctx)

      return response
    },
  })
)
