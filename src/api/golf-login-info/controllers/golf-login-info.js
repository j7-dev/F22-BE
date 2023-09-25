'use strict'

/**
 * golf-login-info controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('api::golf-login-info.golf-login-info', {
  async main(ctx) {
    const login_id = ctx.request?.query?.login_id
    if (!login_id) return ctx.badRequest('login_id is required')

    const infos = await strapi.entityService.findMany(
      'api::golf-login-info.golf-login-info',
      {
        filters: {
          login_id,
        },
        populate: ['user_id'],
        sort: { createdAt: 'desc' },
      }
    )

    const formattedInfos = infos.map((info) => ({
      login_id: info.login_id,
      user_id: info.user_id.id,
      currency: info.currency,
    }))

    ctx.body = {
      status: '200',
      message: 'get golf login info success',
      data: formattedInfos,
    }
  },
})
