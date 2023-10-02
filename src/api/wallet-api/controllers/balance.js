'use strict'

module.exports = {
  async add(ctx) {
    const body = ctx.request.body
    const result = await strapi.service('api::wallet-api.wallet-api').add(body)
    // respond
    ctx.body = {
      status: '200',
      message: 'updateBalance success',
      data: result,
    }
  },
  async get(ctx) {
    const query = ctx.request.query
    const result = await strapi.service('api::wallet-api.wallet-api').get(query)
    ctx.body = {
      status: '200',
      message: 'get cash_balance success',
      data: result,
    }
  },
}
