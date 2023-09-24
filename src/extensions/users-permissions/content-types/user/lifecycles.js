const { nanoid } = require('nanoid')

module.exports = {
  async beforeCreate(event) {
    const result = event?.result
    const params = event?.params
    const data = params?.data
    data.uuid = nanoid()
    if (!data?.display_name) {
      data.display_name = data.username
    }

    console.log('⭐  beforeCreate  agent', data?.agent)
    const agent = data?.agent || undefined

    if (agent) {
    }
  },
  async afterCreate(event) {
    const result = event?.result
    const created_user_id = result?.id

    // 取得支援的幣別
    const siteSetting = await strapi.entityService.findMany(
      'api::site-setting.site-setting'
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
