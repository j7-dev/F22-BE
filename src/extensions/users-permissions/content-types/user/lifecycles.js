const { nanoid } = require('nanoid')

module.exports = {
  async beforeCreate(event) {
    const { result, params } = event
    const data = params?.data
    data.uuid = nanoid()
    if (!data?.display_name) {
      data.display_name = data.username
    }
  },
  async afterCreate(event) {
    const { result } = event
    const created_user_id = result?.id

    // 取得支援的幣別
    const siteSetting = await strapi.entityService.findMany(
      'api::site-setting.site-setting'
    )
    const supportCurrencies = siteSetting?.support_currency

    // 取得全 amount type id
    const amountTypeIds = await strapi.entityService.findMany(
      'api::amount-type.amount-type',
      {
        fields: ['id'],
      }
    )

    supportCurrencies.forEach(async (currency) => {
      amountTypeIds.forEach(async (amountType) => {
        const { id: amount_type_id } = amountType
        const createResult = await strapi.entityService.create(
          'api::balance.balance',
          {
            data: {
              amount: 0,
              user: created_user_id,
              currency,
              amount_type: amount_type_id,
            },
          }
        )
      })
    })
  },
}
