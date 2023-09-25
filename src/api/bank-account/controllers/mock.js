const { createCoreController } = require('@strapi/strapi').factories
const { faker } = require('@faker-js/faker')

module.exports = createCoreController(
  'api::bank-account.bank-account',
  ({ strapi }) => ({
    main: async (ctx) => {
      const qty = ctx.request.body?.qty || 10

      const allUser = await strapi.entityService.findMany(
        'plugin::users-permissions.user',
        {
          fields: ['id'],
        }
      )

      for (let i = 0; i < qty; i++) {
        const randomUser = faker.helpers.arrayElement(allUser)

        const createResult = await strapi.entityService.create(
          'api::bank-account.bank-account',
          {
            data: {
              label: faker.finance.accountName(),
              bank_name: `${faker.location.city()} Bank`,
              bank_code: faker.finance.accountNumber(3),
              bank_account_number: faker.finance.accountNumber(12),
              owner_real_name: faker.finance.accountName(),
              user: randomUser?.id,
            },
          }
        )
      }

      ctx.body = {
        status: '200',
        message: `✅ mock ${qty} bank-account success`,
        data: {},
      }
    },
  })
)
