module.exports = async (event) => {
  const { result } = event
  const txn_id = result?.id
  const theTxn = await strapi.entityService.findOne(
    'api::transaction-record.transaction-record',
    txn_id,
    {
      populate: {
        user: {
          fields: ['id'],
        },
      },
    }
  )

  const user_id = theTxn?.user?.id
  const theUser = await strapi.entityService.findOne(
    'plugin::users-permissions.user',
    user_id,
    {
      fields: ['id', 'username'],
      populate: {
        vip: {
          fields: ['id', 'label', 'order'],
        },
      },
    }
  )
  const nextLevelVips = await strapi.entityService.findMany('api::vip.vip', {
    filters: {
      order: {
        $gt: theUser?.vip?.order,
      },
    },
    limit: 1,
  })

  if (nextLevelVips.length === 0) return

  const nextLevelVip = nextLevelVips[0]
  const deposit_upgrade_threshold = nextLevelVip?.deposit_upgrade_threshold || 0
  const valid_bet_amount_upgrade_threshold =
    nextLevelVip?.valid_bet_amount_upgrade_threshold || 0
  const siteSetting = global.appData.siteSetting
  const default_currency = siteSetting?.default_currency
  const default_amount_type = siteSetting?.default_amount_type

  // 取得用戶累積存款
  const userDeposit = await strapi
    .service('plugin::utility.bettingAmount')
    .get({
      type: ['DEPOSIT'],
      currency: default_currency,
      amount_type: default_amount_type,
      user_id: user_id,
    })

  // 取得用戶累積投注
  const userDebit =
    ((await strapi.service('plugin::utility.bettingAmount').get({
      type: ['DEBIT'],
      currency: default_currency,
      amount_type: default_amount_type,
      user_id: user_id,
    })) || 0) * -1
  // console.log('⭐  info:', {
  //   user_id,
  //   nextLevelVip,
  //   userDeposit,
  //   deposit_upgrade_threshold,
  //   userDebit,
  //   valid_bet_amount_upgrade_threshold,
  //   meet:
  //     userDeposit >= deposit_upgrade_threshold &&
  //     userDebit >= valid_bet_amount_upgrade_threshold,
  // })

  // 條件滿足，升級VIP
  if (
    userDeposit >= deposit_upgrade_threshold &&
    userDebit >= valid_bet_amount_upgrade_threshold
  ) {
    const updateResult = await strapi.entityService.update(
      'plugin::users-permissions.user',
      user_id,
      {
        data: {
          vip: nextLevelVip?.id,
        },
      }
    )

    return updateResult
  }
}
