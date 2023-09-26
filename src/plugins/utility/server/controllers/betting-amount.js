'use strict'

module.exports = ({ strapi }) => ({
  async getWin(ctx) {
    const query = ctx.request.query
    const result = await strapi
      .service('plugin::utility.bettingAmount')
      .getWin(query)
    ctx.body = {
      status: '200',
      message: 'get win success',
      data: result,
    }
  },
  async getLoss(ctx) {
    const query = ctx.request.query
    const result = await strapi
      .service('plugin::utility.bettingAmount')
      .getLoss(query)
    ctx.body = {
      status: '200',
      message: 'get loss success',
      data: result,
    }
  },
  async getWinLossRatio(ctx) {
    const query = ctx.request.query
    const result = await strapi
      .service('plugin::utility.bettingAmount')
      .getWinLossRatio(query)
    ctx.body = {
      status: '200',
      message: 'get WinLoss Ratio success',
      data: result,
    }
  },
})
