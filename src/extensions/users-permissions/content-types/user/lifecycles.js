const { nanoid } = require('nanoid')

module.exports = {
  async beforeCreate(event) {
    const { params } = event
    const { data } = params
    data.uuid = nanoid()
    data.confirmed = false
  },
  async afterCreate(event) {
    const { result } = event
    const created_user_id = result?.id

    // 取得支援的幣別
    const siteSetting = global.appData.siteSetting
    const supportCurrencies = siteSetting?.support_currencies || ['KRW']
    const supportAmountTypes = siteSetting?.support_amount_types || ['CASH']

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
