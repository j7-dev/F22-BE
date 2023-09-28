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

      const siteSetting = await strapi.entityService.findMany(
        'api::site-setting.site-setting'
      )
      const defaultCurrency = siteSetting?.default_currency
      const currency =
        (body?.data?.currency || '').toUpperCase() || defaultCurrency || null

      // 如果沒有帶參數就回 400
      const requiredFields = ['user_id', 'session_id']

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
