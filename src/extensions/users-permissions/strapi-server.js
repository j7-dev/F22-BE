const { faker } = require('@faker-js/faker')
const user = require('./content-types/user')

const getUserName = (role) => {
  switch (role) {
    case 1:
      return 'user'
    case 3:
      return 'agent'
    default:
      return 'user'
  }
}

module.exports = (plugin) => {
  plugin.contentTypes.role.schema.pluginOptions = {
    'content-manager': {
      visible: true,
    },
    'content-type-builder': {
      visible: true,
    },
  }

  plugin.controllers.user.mock = async (ctx) => {
    try {
      const qty = ctx.request.body?.qty || 10
      const role = ctx.request.body?.role || 2
      // 1 = authenticated, 2 = public, 3 = agent

      const latestUser = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          select: ['id'],
          orderBy: { id: 'DESC' },
        })

      const latestUserId = latestUser?.id || null

      const userName = getUserName(role)
      for (let i = 0; i < qty; i++) {
        const createResult = await strapi.entityService.create(
          'plugin::users-permissions.user',
          {
            data: {
              username: `${userName}_${latestUserId + i}`,
              email: `${userName}_${latestUserId + i}@gmail.com`,
              password: '123456',
              confirmed: true,
              role,
              blocked: false,
              cash_balance: 0,
              reward_point_balance: 0,
              display_name: faker.person.fullName(),
              phone: faker.phone.number('0#-####-####'),
              gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
              birthday: faker.date.birthdate({ min: 18, max: 55, mode: 'age' }),
            },
          }
        )
        console.log(
          '⭐  plugin.controllers.user.mock=  createResult',
          createResult
        )
      }

      ctx.body = {
        status: '200',
        message: `✅ mock ${qty} users success`,
        data: {},
      }
    } catch (err) {
      ctx.body = err
    }
  }

  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/user/mock',
    handler: 'user.mock',
    config: {
      prefix: '',
    },
  })

  plugin.contentTypes.user = user

  return plugin
}
