'use strict'

module.exports = {
  main: async (ctx, next) => {
    const { uid } = ctx.request.query
    if (uid === undefined) {
      return ctx.badRequest('uid is required')
    }

    const infos = await strapi.entityService.findMany(
      'api::token-uid-info.token-uid-info',
      {
        filters: {
          uid,
        },
        populate: ['user_id'],
        sort: { createdAt: 'desc' },
      }
    )

    const formattedInfos = infos.map((info) => ({
      // id: info.id,
      uid: info.uid,
      currency: info.currency,
      // created_at: info.createdAt,
      user_id: info.user_id.id,
    }))

    ctx.body = {
      status: '200',
      message: 'get token uid info success',
      data: formattedInfos,
    }
  },
}
