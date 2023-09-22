const userContentType = require('./content-types/user')

module.exports = (plugin) => {
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
      { populate: ['role', 'vip', 'balances'] }
    )

    ctx.body = sanitizeOutput(user)
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
