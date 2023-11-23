'use strict'

/**
 * transaction-record service
 */

const { createCoreService } = require('@strapi/strapi').factories
const handleVip = require('./handleVip')

module.exports = createCoreService(
  'api::transaction-record.transaction-record',
  {
    handleVip,
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
        // 因為 DEBIT 投注的金額都是負數，所以要乘以 -1
        const turnover_bonus = turnover_rate * amount * -1
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
    async handleRemoveDepositBonus(event) {
      const LIMIT_AMOUNT = 10000
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

      // 檢查用戶身上的 BALANCE
      const balances =
        (await strapi.entityService.findMany('api::balance.balance', {
          filters: {
            user: user_id,
          },
        })) || []

      const findBalance = balances.find(
        (b) => b.currency === 'KRW' && b.amount_type === 'CASH'
      )

      // 餘額 <= 10000 時解除限制
      const isLimited = (findBalance?.amount || 0) > LIMIT_AMOUNT
      console.log('⭐  isLimited:', isLimited)

      if (!isLimited) {
        const updateUserResult = await strapi.entityService.update(
          'plugin::users-permissions.user',
          user_id,
          {
            data: {
              last_deposit: {
                set: [],
              },
            },
          }
        )
        return updateUserResult
      }
    },
    // 提款流程
    // 1. 申請提款之後  先扣 balance
    // 2-1. 管理員  APPROVED -> 狀態改變而已
    // 2-2. 管理員 CANCEL-> 退回 balance
    async handleWithdraw(event) {
      // 1. 申請提款之後  先扣 balance

      const { params = {} } = event
      const { data = {} } = params
      const amount = data?.amount
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
    async handleDepositBonus(event) {
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
            },
            deposit_bonus: {
              fields: '*',
            },
          },
        }
      )
      const user_id = theTxn?.user?.id

      if (!user_id) {
        throw new Error('user_id is required')
      }

      // TODO 存款紅利判斷 案類型 不同規則
      // 存款紅利發放

      const deposit_bonus = theTxn?.deposit_bonus
      const min_deposit_amount = deposit_bonus?.min_deposit_amount || 0

      if (!!deposit_bonus && amount >= min_deposit_amount) {
        const bonus_rate = deposit_bonus?.bonus_rate / 100
        const calculate_bonus = bonus_rate * amount
        const max_bonus_amount = deposit_bonus?.max_bonus_amount || 0
        const bonus = !!max_bonus_amount
          ? calculate_bonus > max_bonus_amount
            ? max_bonus_amount
            : calculate_bonus
          : calculate_bonus

        // 將 bonus 寫入 balance
        const result = await strapi.service('api::wallet-api.wallet-api').add({
          user_id: user_id,
          amount: bonus,
          title: `deposit_bonus ${deposit_bonus.label} #${deposit_bonus.id}`,
          type: 'COUPON',
          by: 'SYSTEM',
          currency: deposit_bonus.currency,
          amount_type: deposit_bonus.amount_type,
        })
        return result
      }

      return 'no deposit_bonus'
    },
    async handleBetRecords(event) {
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
      const ref_id = theTxn?.ref_id

      if (!ref_id) return 'ref_id is null'

      const findBR = await strapi.entityService.findMany(
        'api::bet-record.bet-record',
        {
          filters: {
            user: user_id,
            ref_id,
          },
        }
      )
      console.log('⭐  findBR:', findBR)

      const { type, by, title, description, amount } = theTxn

      if (findBR.length === 0) {
        // 第一次投注，寫入 bet_records
        const createBR = await strapi.entityService.create(
          'api::bet-record.bet-record',
          {
            data: {
              by,
              title,
              description,
              debit_amount: type === 'DEBIT' ? amount : null,
              credit_amount: type === 'CREDIT' ? amount : null,
              ref_id,
              user: user_id,
              status: type === 'CANCEL' ? 'CANCEL' : 'PENDING',
              bet_time: theTxn?.createdAt,
              update_time: null,
            },
          }
        )
        return createBR
      } else {
        // 有其他同場遊戲的投注，用更新累加，不是寫入
        const theBR = findBR?.[0]

        if (type === 'DEBIT') {
          const updateBR = await strapi.entityService.update(
            'api::bet-record.bet-record',
            theBR?.id,
            {
              data: {
                by,
                title,
                description,
                debit_amount: Number(amount || 0) + Number(theBR?.amount || 0),
                update_time: theTxn?.createdAt,
              },
            }
          )
          return updateBR
        }

        if (type === 'CREDIT') {
          const updateBR = await strapi.entityService.update(
            'api::bet-record.bet-record',
            theBR?.id,
            {
              data: {
                by,
                title,
                description,
                credit_amount: Number(amount || 0) + Number(theBR?.amount || 0),
                status: 'NORMAL',
                update_time: theTxn?.createdAt,
              },
            }
          )
          return updateBR
        }

        if (type === 'CANCEL') {
          const updateBR = await strapi.entityService.update(
            'api::bet-record.bet-record',
            theBR?.id,
            {
              data: {
                by,
                title,
                description,
                credit_amount: Number(amount || 0),
                status: 'CANCEL',
                update_time: theTxn?.createdAt,
              },
            }
          )
          return updateBR
        }
      }
    },
  }
)
