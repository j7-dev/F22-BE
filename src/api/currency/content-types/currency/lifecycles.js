module.exports = {
  afterCreate: async (event) => {
    const { result, params } = event
    const { id: currency_id, label, slug } = result

    // 取得全 user id
    const userIds = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      {
        fields: ['id'],
      }
    )

    // 取得全 amount type id
    const amountTypeIds = await strapi.entityService.findMany(
      'api::amount-type.amount-type',
      {
        fields: ['id'],
      }
    )

    userIds.forEach(async (user) => {
      const { id: user_id } = user

      amountTypeIds.forEach(async (amountType) => {
        const { id: amount_type_id } = amountType
        const createResult = await strapi.entityService.create(
          'api::balance.balance',
          {
            data: {
              amount: 0,
              user: user_id,
              currency: currency_id,
              amount_type: amount_type_id,
            },
          }
        )
        console.log('⭐  afterCreate:  balance', createResult)
      })
    })

    // do something to the result;
  },
}
