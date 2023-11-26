const { nanoid } = require('nanoid')

module.exports = {
  async beforeCreate(event) {
    const { params } = event
    const { data } = params
    const siteSetting = global.appData.siteSetting

    const default_vip_id = siteSetting?.default_vip?.id || null
    data.uuid = nanoid()

    const user_status = data?.user_status
    if (user_status === 'ACTIVE') {
      data.confirmed = true
    } else {
      data.confirmed = false
    }

    if (default_vip_id) {
      data.vip = default_vip_id
    }
    if (data?.bank_account?.owner_real_name) {
      data.display_name = data?.bank_account?.owner_real_name
    } else {
      data.display_name = data?.username
    }

    // 建立代理關係

    const ref = data?.ref

    //如果沒有手動指定代理，就用 localStorage 的查看
    if (!data?.agent) {
      if (ref) {
        const referralUser = await strapi.entityService.findMany(
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
        const role = referralUser?.[0]?.role.type
        const referralUserId = referralUser?.[0]?.id

        if (referralUser.length > 0 && role === 'agent') {
          data.agent = referralUserId
        }

        data.referral = referralUserId
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

  async beforeUpdate(event) {
    // 當 updatedUserId 變成代理時，將本部的用戶轉移到 updatedUserId
    const { params } = event
    const updatedUserId = params?.where?.id
    const { data } = params
    const toRole = data?.role
    const user_status = data?.user_status
    if (user_status === 'ACTIVE') {
      data.confirmed = true
    } else {
      data.confirmed = false
    }

    const referralUsers = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      {
        fields: ['id'],
        filters: {
          referral: updatedUserId,
          agent: null,
        },
      }
    )

    const referralUserIds = referralUsers.map((user) => user?.id)

    if (toRole === 3) {
      // 3 = agent
      const results = await Promise.all(
        referralUserIds.map(async (userId) => {
          const result = await strapi.entityService.update(
            'plugin::users-permissions.user',
            userId,
            {
              data: {
                agent: updatedUserId,
              },
            }
          )
          return result
        })
      )
    }
  },
}
