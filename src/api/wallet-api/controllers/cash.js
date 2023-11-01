'use strict'

module.exports = {
  async withdraw(ctx) {
    const body = ctx.request.body

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
  },
  async deposit(ctx) {
    const body = ctx.request.body

    const dpResult = await strapi
      .service('api::wallet-api.wallet-api')
      .deposit(body)
    const txnId = dpResult?.id || null

    if (txnId) {
      ctx.body = {
        status: '200',
        message: 'create transaction success',
        data: dpResult,
      }
    } else {
      ctx.body = {
        status: '400',
        message: 'create transaction fail',
        data: dpResult,
      }
    }
  },
}
