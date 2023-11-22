'use strict'

/**
 * igx-gp service
 */

module.exports = () => ({
  async saveToGolfLoginInfo(login_id) {
    const USERNAME_PREFIX = process?.env?.USERNAME_PREFIX
    const siteSetting = global.appData.siteSetting
    const default_currency = siteSetting?.default_currency
    const findRecord = await strapi.entityService.findMany(
      'api::golf-login-info.golf-login-info',
      {
        filters: {
          login_id: login_id,
        },
      }
    )

    const theUser = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      login_id,
      {
        fields: ['id', 'username'],
      }
    )

    // 如果沒有  就創建
    if (findRecord.length === 0) {
      const createLoginInfoResult = await strapi.entityService.create(
        'api::golf-login-info.golf-login-info',
        {
          data: {
            login_id: login_id,
            currency: default_currency,
            user_id: theUser?.id,
            username: `${USERNAME_PREFIX}_${theUser?.username}`,
          },
        }
      )
      return createLoginInfoResult
    }

    return findRecord?.[0]
  },
})
