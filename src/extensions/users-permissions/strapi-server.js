const userContentType = require('./content-types/user')
const dayjs = require('dayjs')

module.exports = (plugin) => {
  const UTC9toUTC0 = global.appData.UTC9toUTC0

  // support lifecycles
  plugin.contentTypes.user = userContentType

  plugin.contentTypes.role.schema.pluginOptions = {
    'content-manager': {
      visible: true,
    },
    'content-type-builder': {
      visible: true,
    },
  }

  // 登入時紀錄資訊
  plugin.routes['content-api'].routes = plugin.routes['content-api'].routes.map(
    (item) => {
      if (item.method == 'POST' && item.path == '/auth/local') {
        item.config.middlewares = ['global::loginDetail']
      }

      return item
    }
  )

  // 讓 user/me 支援 populate

  const sanitizeOutput = (user) => {
    const {
      password,
      resetPasswordToken,
      confirmationToken,
      ...sanitizedUser
    } = user // be careful, you need to omit other private attributes yourself
    return sanitizedUser
  }

  plugin.controllers.user.me = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized()
    }
    const user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      ctx.state.user.id,
      {
        populate: {
          role: {
            fields: '*',
          },
          vip: {
            fields: '*',
          },
          balances: {
            fields: '*',
          },
          last_deposit: {
            fields: '*',
            populate: {
              deposit_bonus: {
                fields: '*',
              },
            },
          },
        },
      }
    )

    const siteSetting = global.appData.siteSetting
    const vip_upgrade_evaluation_interval =
      siteSetting?.vip_upgrade_evaluation_interval || 30
    const vip_upgrade_evaluation_interval_unit =
      siteSetting?.vip_upgrade_evaluation_interval_unit || 'day'
    const user_id = user.id

    const deposit = await strapi.service('plugin::utility.dpWd').getDeposit({
      user_id,
      start: UTC9toUTC0(
        dayjs().subtract(
          vip_upgrade_evaluation_interval,
          vip_upgrade_evaluation_interval_unit
        )
      ),
      end: UTC9toUTC0(dayjs()),
    })

    const validBetAmount = await strapi
      .service('plugin::utility.bettingAmount')
      .getDebit({
        user_id,
        start: UTC9toUTC0(
          dayjs().subtract(
            vip_upgrade_evaluation_interval,
            vip_upgrade_evaluation_interval_unit
          )
        ),
        end: UTC9toUTC0(dayjs()),
      })

    const allBalances = await strapi
      .service('plugin::utility.utils')
      .handleBalances(user?.balances || [], user_id)

    ctx.body = sanitizeOutput({
      ...user,
      balances: allBalances,
      deposit,
      validBetAmount,
    })
  }

  plugin.services.isUserExist = {
    async byUserId(user_id) {
      if (!user_id) throw new Error('user_id is required')
      const getUserResult = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user_id,
        {
          fields: ['id'],
        }
      )
      return !!getUserResult
    },
  }

  // 會讓refine的filter失效
  // plugin.controllers.user.find = async (ctx) => {
  //   const users = await strapi.entityService.findMany(
  //     'plugin::users-permissions.user',
  //     { ...ctx.params, populate: ['role'] }
  //   )

  //   ctx.body = users.map((user) => sanitizeOutput(user))
  // }

  return plugin
}
