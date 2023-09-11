'use strict'

module.exports = {
  async add(ctx) {
    const body = ctx.request.body
    try {
      const result = await strapi
        .service('api::wallet-api.wallet-api')
        .add(body)
      console.log('⭐  add  result', result)
      // respond
      ctx.body = {
        status: '200',
        message: 'updateBalance success',
        data: result,
      }
    } catch (err) {
      ctx.body = err
    }
  },
  async get(ctx) {
    const query = ctx.request.query
    try {
      const result = await strapi
        .service('api::wallet-api.wallet-api')
        .get(query)
      ctx.body = {
        status: '200',
        message: 'get cash_balance success',
        data: result,
      }
    } catch (err) {
      ctx.body = err
    }
  },
}
