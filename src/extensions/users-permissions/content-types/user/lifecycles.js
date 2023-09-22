module.exports = {
  async afterCreate(event) {
    const { result } = event
    const created_user_id = result?.id

    const currencies = await strapi.entityService.findMany(
      'api::currency.currency'
    )
    const supportCurrencies = siteSetting?.support_currencies || []

    // 取得全 amount type id
    const amountTypeIds = await strapi.entityService.findMany(
      'api::amount-type.amount-type',
      {
        fields: ['id'],
      }
    )

    currencies.forEach(async (currency) => {
      const { id: currency_id } = currency
      amountTypeIds.forEach(async (amountType) => {
        const { id: amount_type_id } = amountType
        const createResult = await strapi.entityService.create(
          'api::balance.balance',
          {
            data: {
              amount: 0,
              user: created_user_id,
              currency: currency_id,
              amount_type: amount_type_id,
            },
          }
        )
      })
    })
  },
}
