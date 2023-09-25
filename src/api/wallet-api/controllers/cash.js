'use strict'

module.exports = {
  async withdraw(ctx) {
    const body = ctx.request.body
    try {
      const withdrawResult = await strapi
        .service('api::wallet-api.wallet-api')
        .withdraw(body)
      const txnId = withdrawResult?.id || null

      if (txnId) {
        ctx.body = {
          status: '200',
          message: 'create transaction success',
          data: withdrawResult,
        }
      } else {
        ctx.body = {
          status: '400',
          message: 'create transaction fail',
          data: withdrawResult,
        }
      }
    } catch (err) {
      ctx.body = err
    }
  },
}
