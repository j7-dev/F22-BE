'use strict'

module.exports = ({ strapi }) => ({
  /**
   *
   * @param user_id?: number,
   * @param gameProviderNames?: string[]
   */
  async get(ctx) {
    const query = ctx.request.query
    console.log('⭐  query:', query)
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
