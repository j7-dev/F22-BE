'use strict'

module.exports = {
  main: async (ctx, next) => {
    const { token } = ctx.request.query
    if (token === undefined) {
      return ctx.badRequest('token is required')
    }

    const infos = await strapi.entityService.findMany(
      'api::pp-token-info.pp-token-info',
      {
        filters: {
          token,
        },
        populate: ['user_id'],
        sort: { createdAt: 'desc' },
      }
    )

    const formattedInfos = infos.map((info) => ({
      token: info.token,
      currency: info.currency,
      user_id: info.user_id.id,
      created_at: info.createdAt,
    }))

    ctx.body = {
      status: '200',
      message: 'get pp token info success',
      data: formattedInfos,
    }
  },
  check: async (ctx, next) => {
    const { session_id } = ctx.request.query
    if (session_id === undefined) {
      return ctx.badRequest('session_id is required')
    }

    const infos = await strapi.entityService.findMany(
      'api::evo-session-info.evo-session-info',
      {
        filters: {
          session_id,
        },
        populate: ['user_id'],
        sort: { createdAt: 'desc' },
      }
    )

    const isExist = infos.length > 0

    ctx.body = {
      status: '200',
      message: 'check evo session info success',
      data: isExist,
    }
  },
}
