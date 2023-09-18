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
      const siteSetting = await strapi.entityService.findMany(
        'api::site-setting.site-setting'
      )
      const defaultCurrency = siteSetting?.default_currency
      const currency =
        body.data.currency.toUpperCase() || defaultCurrency || null

      if (user_id === undefined) {
        return ctx.badRequest('user_id is required')
      }
      if (currency === undefined) {
        return ctx.badRequest('currency is required')
      }

      const response = await super.create(ctx)

      return response
    },
  })
)
