'use strict'

/**
 * bti-token-info service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService(
  'api::bti-token-info.bti-token-info',
  ({ strapi }) => ({
    get: async ({ token }) => {
      if (token === undefined) {
        return 'token is required'
      }

      try {
        const infos = await strapi.entityService.findMany(
          'api::bti-token-info.bti-token-info',
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

        return {
          status: '200',
          message: 'get pp token info success',
          data: formattedInfos,
        }
      } catch (err) {
        return '500 internal server error'
      }
    },
  })
)
