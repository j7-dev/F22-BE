const { nanoid } = require('nanoid')

module.exports = {
  async beforeCreate(event) {
    const { params } = event
    const { data } = params
    const siteSetting = global.appData.siteSetting
    const support_payments = siteSetting?.support_payments || []
    const support_game_providers = siteSetting?.support_game_providers || []
    data.uuid = nanoid()
    // 預設全部支付方式都開放
    data.allow_payments = support_payments
    // 預設全部遊戲商都開放
    data.allow_game_providers = support_game_providers
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
