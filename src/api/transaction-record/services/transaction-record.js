'use strict'

/**
 * transaction-record service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService(
  'api::transaction-record.transaction-record',
  {
    async handleTurnoverBonus(event) {
      const { result } = event
      const txn_id = result?.id
      const status = result?.status
      const amount = result?.amount
      const type = result?.type

      const theTxn = await strapi.entityService.findOne(
        'api::transaction-record.transaction-record',
        txn_id,
        {
          populate: {
            user: {
              fields: ['id'],
              populate: {
                vip: {
                  fields: ['id', 'label', 'turnover_rate'],
                },
              },
            },
          },
        }
      )

      // 計算返水 ⚠️ BTI 不參與洗碼
      const turnover_rate = (theTxn?.user?.vip?.turnover_rate || 0) / 100

      // 排除 BTI
      if (theTxn?.by !== 'bti-api') {
        const turnover_bonus = turnover_rate * amount
        const result = await strapi.service('api::wallet-api.wallet-api').add({
          user_id: theTxn?.user?.id,
          amount: turnover_bonus,
          title: `turnover_bonus ${amount} * ${turnover_rate} = ${turnover_bonus}  txn#${theTxn?.id}`,
          type: 'COUPON',
          by: 'SYSTEM',
          currency: theTxn?.currency,
          amount_type: 'TURNOVER_BONUS',
        })

        return result
      } else {
        return '條件不符，沒有執行返水'
      }
    },
    // 提款流程
    // 1. 申請提款之後  先扣 balance
    // 2-1. 管理員  APPROVED -> 狀態改變而已
    // 2-2. 管理員 CANCEL-> 退回 balance
    async handleWithdraw(event) {
      // 1. 申請提款之後  先扣 balance

      const { params = {} } = event
      console.log('⭐  event:', JSON.stringify(event))
      const { data = {} } = params
      const amount = data?.amount
      const type = data?.type
      const currency = data?.currency
      const amount_type = data?.amount_type
      const user_id = data?.user

      if (!user_id) {
        throw new Error('user_id is required')
      }

      // 更新 Balance 不留紀錄
      const updateResult = await strapi
        .service('api::wallet-api.wallet-api')
        .addBalance({
          user_id,
          amount,
          currency,
          amount_type,
          allowNegative: false,
        })

      return updateResult
    },
    async handleCancelWithdraw(event) {
      // 2-2. 管理員 CANCEL-> 退回 balance

      const { result } = event
      const txn_id = result?.id
      const amount = result?.amount
      const currency = result?.currency
      const amount_type = result?.amount_type

      const theTxn = await strapi.entityService.findOne(
        'api::transaction-record.transaction-record',
        txn_id,
        {
          populate: {
            user: {
              fields: ['id'],
              populate: {
                vip: {
                  fields: ['id', 'label', 'turnover_rate'],
                },
              },
            },
          },
        }
      )
      const user_id = theTxn?.user?.id

      if (!user_id) {
        throw new Error('user_id is required')
      }

      // 更新 Balance 不留紀錄
      const updateResult = await strapi
        .service('api::wallet-api.wallet-api')
        .addBalance({
          user_id,
          amount: amount * -1,
          currency,
          amount_type,
          allowNegative: false,
        })

      return updateResult
    },
  }
)
