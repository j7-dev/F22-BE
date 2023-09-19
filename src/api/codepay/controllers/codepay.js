'use strict'

/**
 * A set of functions called "actions" for `codepay`
 */

module.exports = {
  deposit: async (ctx, next) => {
    const body = ctx.request.body

    // 如果沒有帶參數就回 400
    const requiredFields = [
      'simpleAddressFrom',
      'sendPassword',
      'amount',
      'currency',
      'user_id',
    ]

    for (const field of requiredFields) {
      if (body?.[field] === undefined) {
        return ctx.badRequest(`${field} is required`)
      }
    }

    // code pay 儲值
    const newsendResult = await strapi
      .service('api::codepay.codepay')
      .newsend(body)

    try {
      ctx.body = newsendResult?.data
    } catch (err) {
      ctx.body = err
    }
  },
}
