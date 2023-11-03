'use strict'

module.exports = {
  async add(ctx) {
    const body = ctx.request.body
    const result = await strapi.service('api::wallet-api.wallet-api').add(body)
    // respond
    ctx.body = {
      status: '200',
      message: 'updateBalance success',
      data: result,
    }
  },
  async addWithoutRecord(ctx) {
    const body = ctx.request.body
    const result = await strapi
      .service('api::wallet-api.wallet-api')
      .addBalance(body)
    // respond
    ctx.body = {
      status: '200',
      message: 'updateBalance success',
      data: result,
    }
  },
  async get(ctx) {
    const query = ctx.request.query
    const result = await strapi.service('api::wallet-api.wallet-api').get(query)
    ctx.body = {
      status: '200',
      message: 'get cash_balance success',
      data: result,
    }
  },
  async trunoverBonusToCash(ctx) {
    const body = ctx?.request?.body
    const user_id = ctx?.state?.user?.id || body?.user_id
    if (!user_id) {
      ctx.badRequest("can't find user_id")
    }

    const siteSetting = global.appData.siteSetting
    const default_currency = siteSetting?.default_currency

    const currency = body?.currency || default_currency

    // 取得目前 turnover_bonus balance
    const balances =
      (await strapi.service('api::wallet-api.wallet-api').get({
        user_id,
        currency: default_currency,
        amount_type: 'TURNOVER_BONUS',
      })) || []

    const turnoverBonusBalance = balances?.find(
      (b) => b.amount_type === 'TURNOVER_BONUS'
    )

    const amount = turnoverBonusBalance?.amount || 0

    // 扣除 turnover_bonus balance
    const deduct_turnover_bonus_result = await strapi
      .service('api::wallet-api.wallet-api')
      .add({
        user_id,
        amount: amount * -1,
        title: 'TURNOVER_BONUS_TO_CASH',
        type: 'TURNOVER_BONUS_TO_CASH',
        by: 'USER',
        currency,
        amount_type: 'TURNOVER_BONUS',
      })

    // 加到 cash balance
    const add_cash_result = await strapi
      .service('api::wallet-api.wallet-api')
      .add({
        user_id,
        amount,
        title: 'TURNOVER_BONUS_TO_CASH',
        type: 'TURNOVER_BONUS_TO_CASH',
        by: 'USER',
        currency,
        amount_type: 'CASH',
      })

    if (
      deduct_turnover_bonus_result?.result?.id &&
      add_cash_result?.result?.id
    ) {
      ctx.body = {
        status: '200',
        message: 'turnover_bonus to cash success',
      }
    } else {
      ctx.body = {
        status: '500',
        message: {
          deduct_turnover_bonus_result,
          add_cash_result,
        },
      }
    }
    // respond
  },
}
