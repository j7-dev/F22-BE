'use strict'

/**
 * evo-transaction controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController(
  'api::evo-transaction.evo-transaction',
  ({ strapi }) => ({
    async create(ctx) {
      const body = ctx.request.body
      const user_id = body.data.user_id || null
      const currency = body.data.currency || null

      if (user_id === undefined) {
        return ctx.badRequest('user_id is required')
      }
      if (currency === undefined) {
        return ctx.badRequest('currency is required')
      }

      const findCurrencies = await strapi.entityService.findMany(
        'api::currency.currency',
        {
          filters: { slug: currency },
        }
      )

      if (findCurrencies.length === 0) {
        return ctx.badRequest('currency not found')
      }

      const findCurrency = findCurrencies[0]

      body.data.currency = findCurrency.id

      const response = await super.create(ctx)

      return response
    },
  })
)
