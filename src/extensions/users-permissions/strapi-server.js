const user = require('./content-types/user')

module.exports = (plugin) => {
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

  plugin.contentTypes.user = user

  return plugin
}
