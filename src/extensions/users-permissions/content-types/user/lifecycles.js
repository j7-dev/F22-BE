module.exports = {
  async beforeCreate(event) {
    const result = event?.result
    const params = event?.params
    const data = params?.data
    data.uuid = nanoid()
    if (!data?.display_name) {
      data.display_name = data.username
    }

    // const roleId = data?.role
    // const role = await strapi.entityService.findOne(
    //   'plugin::users-permissions.role',
    //   roleId,
    //   {
    //     fields: ['type'],
    //   }
    // )
    // const roleType = role?.type

    // if (roleType === 'authenticated') {
    //   // 一般會員，建立 與 agent 和 top_agent 的關聯
    // }

    // if (roleType === 'agent' && data?.top_agent) {
    //   // 代理，建立 與 top_agent 的關聯
    //   const entry = await strapi.entityService.create(
    //     'api::user-relationship.user-relationship',
    //     {
    //       data: {
    //         level_diff: 1,
    //         user: data?.id,
    //         parent_user: data?.top_agent,
    //       },
    //     }
    //   )
    //   console.log('⭐  beforeCreate  entry', entry)
    // }

    // if (roleType === 'top_agent') {
    //   // 總代理，不用建立關聯
    // }
  },
  async afterCreate(event) {
    const result = event?.result
    const created_user_id = result?.id

    const currencies = await strapi.entityService.findMany(
      'api::currency.currency'
    )
    const supportCurrencies = siteSetting?.support_currencies || []
    const supportAmountTypes = siteSetting?.support_amount_types || []

    supportCurrencies.forEach(async (currency) => {
      supportAmountTypes.forEach(async (amount_type) => {
        const createResult = await strapi.entityService.create(
          'api::balance.balance',
          {
            data: {
              amount: 0,
              user: created_user_id,
              currency,
              amount_type,
            },
          }
        )
      })
    })
  },
}
