'use strict'

module.exports = {
  main: async (ctx, next) => {
    const { session_id } = ctx.request.query
    if (session_id === undefined) {
      return ctx.badRequest('session_id is required')
    }

    try {
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

      const formattedInfos = infos.map((info) => ({
        id: info.id,
        session_id: info.session_id,
        created_at: info.createdAt,
        user_id: info.user_id.id,
      }))

      ctx.body = {
        status: '200',
        message: 'get evo session info success',
        data: formattedInfos,
      }
    } catch (err) {
      ctx.body = err
    }
  },
  check: async (ctx, next) => {
    const { session_id } = ctx.request.query
    if (session_id === undefined) {
      return ctx.badRequest('session_id is required')
    }

    try {
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
    } catch (err) {
      ctx.body = err
    }
  },
}
