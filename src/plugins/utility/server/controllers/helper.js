'use strict'
const { nanoid } = require('nanoid')

module.exports = ({ strapi }) => ({
  // 幫所有用戶都加上 allow_payments & allow_game_providers
  async updateAllUserPaymentsGP(ctx) {
    const siteSetting = global.appData.siteSetting
    const support_payments = siteSetting?.support_payments || []
    const support_game_providers = siteSetting?.support_game_providers || []
    const result = await strapi.db
      .query('plugin::users-permissions.user')
      .updateMany({
        data: {
          allow_payments: support_payments,
          allow_game_providers: support_game_providers,
        },
      })
    ctx.body = {
      status: '200',
      message: 'users allow_payments & allow_game_providers updated',
      data: result,
    }
  },
  // 幫所有沒有uuid的用戶都加上 uuid
  async updateAllUserUUID(ctx) {
    const result = await strapi.db
      .query('plugin::users-permissions.user')
      .updateMany({
        where: {
          uuid: null,
        },
        data: {
          uuid: nanoid(),
        },
      })
    ctx.body = {
      status: '200',
      message: 'users uuid updated',
      data: result,
    }
  },
  // 幫所有沒有vip 的用戶都加上 vip
  async updateAllUserVip(ctx) {
    const body = ctx.request.body
    const entries = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      {
        fields: ['id'],
        filters: {
          vip: null,
        },
      }
    )

    const result = await Promise.all(
      entries.map(async (entry) => {
        const updateResult = await strapi.entityService.update(
          'plugin::users-permissions.user',
          entry.id,
          {
            data: {
              vip: body?.vip_id || null,
            },
          }
        )
        return updateResult
      })
    )

    ctx.body = {
      status: '200',
      message: 'users vip updated',
      data: result,
    }
  },
})
