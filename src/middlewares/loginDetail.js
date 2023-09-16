'use strict'
const requestIp = require('request-ip')
const DeviceDetector = require('node-device-detector')
/**
 * `loginDetail` middleware
 * 紀錄登入資訊
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In loginDetail middleware.')
    await next()

    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false,
    })
    const user_agent =
      detector.detect(ctx?.request?.headers['user-agent']) || {}

    const clientIp = requestIp.getClientIp(ctx?.request) || 'unknown'

    const login_url = ctx?.request?.header?.origin || 'unknown'
    const user = ctx?.response?.body?.user?.id || 'unknown'

    const createResult = await strapi.entityService.create(
      'api::login-detail.login-detail',
      {
        data: {
          ip: clientIp,
          user_agent,
          login_url,
          user,
        },
      }
    )
  }
}
