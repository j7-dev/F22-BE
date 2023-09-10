'use strict'

module.exports = {
  add: async (ctx) => {
    try {
      // Read from POST body
      const body = ctx.request.body

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
        if (!body[field]) {
          return ctx.badRequest(`${field} is required`)
        }
      }

      await strapi.db.transaction(
        async ({ trx, rollback, commit, onCommit, onRollback }) => {
          const findCurrency = await strapi.entityService.findMany(
            'api::currency.currency',
            {
              filters: { slug: body.currency },
            }
          )
          const currency_id = findCurrency[0].id

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
          if (!findBalance) {
            const createResult = await strapi.entityService.create(
              'api::balance.balance',
              {
                data: {
                  amount: 0,
                  user: body.user_id,
                  currency: currency_id,
                  amount_type: amount_type_id,
                },
              }
            )
            console.log('⭐  afterCreate:  balance', createResult)
          }

          // 預防用戶金額不夠扣
          const newBalance =
            Number(findBalance?.amount || 0) + Number(body.amount)
          if (newBalance < 0) {
            return ctx.badRequest(null, 'Insufficient balance')
          }

          // Update the user balance
          const updateResult = await strapi.entityService.update(
            'api::balance.balance',
            findBalance?.id,
            {
              data: {
                amount: newBalance,
              },
            }
          )

          /**
           * @ref https://docs.strapi.io/dev-docs/api/entity-service/crud#create
           * 創建一筆 Transaction Record
           * TODO 之後要考慮到 transaction_record 的 Status 才做紀錄
           */

          const theTransaction = await strapi.entityService.create(
            'api::transaction-record.transaction-record',
            {
              data: {
                title: body.title,
                description: body.description,
                amount: body.amount,
                by: body.by,
                user: body.user_id, // connect
                bet_record: body.bet_record_id, // connect
              },
            }
          )

          // respond
          ctx.body = {
            status: '200',
            message: 'updateBalance success',
            data: updateResult,
          }
        }
      )
    } catch (err) {
      ctx.body = err
    }
  },
  get: async (ctx, next) => {
    try {
      // 取的 query string 的 userId
      const query = ctx.request.query
      const currency = query.currency || undefined

      // 如果沒有帶參數就回 400
      const requiredFields = ['user_id']

      for (const field of requiredFields) {
        if (!ctx.request.query[field]) {
          return ctx.badRequest(`${field} is required`)
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

      ctx.body = {
        status: '200',
        message: 'get cash_balance success',
        data: formattedBalances,
      }
    } catch (err) {
      ctx.body = err
    }
  },
  calculate: async (ctx, next) => {
    try {
      // 取的 query string 的 userId
      const { user_id } = ctx.request.query

      // 如果沒有帶參數就回 400
      const requiredFields = ['user_id']

      for (const field of requiredFields) {
        if (!ctx.request.query[field]) {
          return ctx.badRequest(`${field} is required`)
        }
      }

      // 取得 userId 的所有 transaction-record
      const userTxns = await strapi.entityService.findMany(
        'api::transaction-record.transaction-record',
        {
          fields: ['title', 'amount'],
          filters: { user_id },
          populate: '*',
        }
      )
      console.log('⭐  calculate:  userTxns', userTxns)

      // 計算 cash_balance ，就是遍歷 userTxns 的 amount 加總起來
      // 白話就是  把這 user 的每筆 record 的 amount 加總起來
      const cash_balance = userTxns.reduce((acc, cur) => {
        return acc + cur.amount
      }, 0)

      ctx.body = {
        status: '200',
        message: 'get cash_balance success',
        data: {
          cash_balance,
        },
      }
    } catch (err) {
      ctx.body = err
    }
  },
}
