'use strict'

/**
 * wallet-api service
 */

module.exports = () => ({
  add: async (body) => {
    try {
      // 預設 CASH
      const amount_type = body.amount_type || 'CASH'

      // 如果沒有帶參數就回 400
      const requiredFields = [
        'type',
        'by',
        'title',
        'amount',
        'user_id',
        'currency',
      ]

      for (const field of requiredFields) {
        if (body[field] === undefined) {
          return `${field} is required`
        }
      }

      return await strapi.db.transaction(
        async ({ trx, rollback, commit, onCommit, onRollback }) => {
          const findCurrency = await strapi.entityService.findMany(
            'api::currency.currency',
            {
              filters: { slug: body.currency },
            }
          )
          const currency_id = findCurrency[0].id
          const currency_slug = findCurrency[0].slug

          const findAmountType = await strapi.entityService.findMany(
            'api::amount-type.amount-type',
            {
              filters: { slug: amount_type },
            }
          )
          const amount_type_id = findAmountType[0].id

          const findBalances =
            (await strapi.entityService.findMany('api::balance.balance', {
              filters: {
                user: body.user_id,
                currency: currency_id,
                amount_type: amount_type_id,
              },
            })) || []
          const findBalance = findBalances[0] || null

          // 沒有 balance 就新增初始值 0

          const createBalanceResult = !!findBalance
            ? null
            : await strapi.entityService.create('api::balance.balance', {
                data: {
                  amount: 0,
                  user: body.user_id,
                  currency: currency_id,
                  amount_type: amount_type_id,
                },
              })

          const theBalanceId =
            findBalance?.id || createBalanceResult?.id || null

          // 預防用戶金額不夠扣
          const newBalance =
            Number(findBalance?.amount || 0) + Number(body.amount)
          if (newBalance < 0) {
            return 'Insufficient balance'
          }

          // Update the user balance
          let status = 'PENDING'
          try {
            const updateResult = await strapi.entityService.update(
              'api::balance.balance',
              theBalanceId,
              {
                data: {
                  amount: newBalance,
                },
              }
            )
            status = 'SUCCESS'
          } catch (error) {
            status = 'FAILED'
          }

          const updatedBalanceAmount =
            status === 'SUCCESS' ? newBalance : findBalance?.amount

          /**
           * @ref https://docs.strapi.io/dev-docs/api/entity-service/crud#create
           * 創建一筆 Transaction Record
           * TODO 之後要考慮到 transaction_record 的 Status 才做紀錄
           */

          const createTxnResult = await strapi.entityService.create(
            'api::transaction-record.transaction-record',
            {
              data: {
                type: body.type,
                title: body.title,
                description: body.description,
                amount: body.amount,
                by: body.by,
                user: body.user_id, // connect
                bet_record: body.bet_record_id, // connect
                status,
              },
            }
          )

          const result = {
            result: createTxnResult,
            balance: {
              amount: updatedBalanceAmount.toString(),
              currency: currency_slug,
            },
          }

          return result
        }
      )
    } catch (err) {
      return err
    }
  },
  get: async (query) => {
    try {
      // 取的 query string 的 userId
      const currency = query.currency || undefined

      // 如果沒有帶參數就回 400
      const requiredFields = ['user_id']

      for (const field of requiredFields) {
        if (query[field] === undefined) {
          return `${field} is required`
        }
      }

      // 取得 user 的所有 balance
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        query.user_id,
        {
          populate: {
            balances: {
              fields: ['amount'],
              populate: {
                amount_type: {
                  fields: ['slug'],
                },
                currency: {
                  fields: ['slug'],
                },
              },
            },
          },
        }
      )

      const userBalances = user?.balances || []

      if (!!currency) {
        const findBalance = userBalances.find(
          (balance) => balance.currency.slug === query.currency
        )

        // 沒有 balance 就新增初始值 0
        if (!findBalance) {
        }
      }

      const formattedBalances = userBalances.map((balance) => {
        return {
          ...balance,
          amount: balance.amount.toString(),
          amount_type: balance.amount_type.slug,
          currency: balance.currency.slug,
        }
      })

      return formattedBalances
    } catch (err) {
      return err
    }
  },
})
