const { nanoid } = require('nanoid')

module.exports = {
  async beforeCreate(event) {
    const { params } = event
    const { data } = params
    const siteSetting = global.appData.siteSetting
    const support_payments = siteSetting?.support_payments || []
    const support_game_providers = siteSetting?.support_game_providers || []
    const default_vip_id = siteSetting?.default_vip?.id || null
    data.uuid = nanoid()
    // 預設全部支付方式都開放
    data.allow_payments = support_payments
    // 預設全部遊戲商都開放
    data.allow_game_providers = support_game_providers
    data.confirmed = false
    if (default_vip_id) {
      data.vip = default_vip_id
    }
    if (data?.bank_account?.owner_real_name) {
      data.display_name = data?.bank_account?.owner_real_name
    }

    // 建立代理關係

    const ref = data?.ref

    //如果沒有手動指定代理，就用 localStorage 的查看
    if (!data?.agent) {
      if (ref) {
        const findAgent = await strapi.entityService.findMany(
          'plugin::users-permissions.user',
          {
            populate: {
              role: {
                fields: ['id', 'type'],
              },
            },
            filters: { username: ref },
          }
        )
        // 確認這個用戶是否為 agent
        const role = findAgent?.[0]?.role.type
        const agentId = findAgent?.[0]?.id

        if (findAgent.length > 0 && role === 'agent') {
          data.agent = agentId
        }
      }
    }
  },
  async afterCreate(event) {
    const { result } = event
    const created_user_id = result?.id

    // 創造用戶 balance
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
