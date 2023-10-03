'use strict'

module.exports = ({ strapi }) => ({
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
      message: 'users updated',
      data: result,
    }
  },
})
