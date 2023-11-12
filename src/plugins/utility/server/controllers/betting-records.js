'use strict'

module.exports = ({ strapi }) => ({
  /**
   * @deprecated
   * @param user_id?: number
   * @param gameProviderName?: string
   */
  async get(ctx) {
    const query = ctx.request.query
    const result = await strapi
      .service('plugin::utility.bettingRecords')
      .get(query)
    ctx.body = {
      status: '200',
      message: 'get Betting Records success',
      data: result,
    }
  },
})
