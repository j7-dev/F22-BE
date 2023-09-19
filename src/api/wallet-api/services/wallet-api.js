'use strict'

/**
 * wallet-api service
 */

module.exports = () => ({
  add: async (body) => {
    try {
      // 預設 CASH
      const amount_type =
        body.amount_type || process.env?.DEFAULT_AMOUNT_TYPE || 'CASH'

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

      // 取得幣別
      const siteSetting = await strapi.entityService.findMany(
        'api::site-setting.site-setting'
      )
      const defaultCurrency = siteSetting?.default_currency

      const currency =
        body?.data?.currency.toUpperCase() || defaultCurrency || null

      const findAmountType = await strapi.entityService.findMany(
        'api::amount-type.amount-type',
        {
          filters: { slug: amount_type },
        }
      )

      // 如果沒有找到 amount_type 就回 400
      if (!findAmountType.length) {
        return `amount_type ${amount_type} is not found`
      }

      const amount_type_id = findAmountType[0].id

      const balances =
        (await strapi.entityService.findMany('api::balance.balance', {
          filters: {
            user: body.user_id,
            currency,
            amount_type: amount_type_id,
          },
        })) || []
      const findBalance = balances[0] || null

      // 沒有 balance 就新增初始值 0
      const createBalanceResult = !!findBalance
        ? null
        : await strapi.entityService.create('api::balance.balance', {
            data: {
              amount: 0,
              user: body.user_id,
              currency,
              amount_type: amount_type_id,
            },
          })

      const theBalanceId = findBalance?.id || createBalanceResult?.id || null

      // 計算修改後的 balance
      const newBalance = Number(findBalance?.amount || 0) + Number(body.amount)

      // 預防用戶金額不夠扣
      const allowNegative = body?.allowNegative ?? false
      if (newBalance < 0 && !allowNegative) {
        return 'Insufficient balance'
      }

      let status = 'PENDING'

      // 更新 balance
      await strapi.db.transaction(
        async ({ trx, rollback, commit, onCommit, onRollback }) => {
          // Update the user balance

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
        }
      )

      // const updatedBalanceAmount =
      //   status === 'SUCCESS' ? newBalance : findBalance?.amount

      /**
       * @ref https://docs.strapi.io/dev-docs/api/entity-service/crud#create
       * 創建一筆 Transaction Record
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
            currency,
          },
        }
      )

      const userBalances = await strapi.entityService.findMany(
        'api::balance.balance',
        {
          filters: {
            user: body.user_id,
          },
          populate: {
            amount_type: {
              fields: ['slug'],
            },
          },
        }
      )
      const formattedUserBalances = userBalances.map((balance) => ({
        ...balance,
        amount: balance.amount.toString(),
        amount_type:
          balance?.amount_type?.slug ||
          process.env?.DEFAULT_AMOUNT_TYPE ||
          'CASH',
        currency: balance.currency,
      }))

      const result = {
        result: createTxnResult,
        balances: formattedUserBalances,
      }

      return result
    } catch (err) {
      return err
    }
  },
  get: async (query) => {
    try {
      const siteSetting = await strapi.entityService.findMany(
        'api::site-setting.site-setting'
      )
      const defaultCurrency = siteSetting?.default_currency

      const currency = query?.currency || defaultCurrency || null

      // 如果沒有帶參數就回 400
      const requiredFields = ['user_id']

      for (const field of requiredFields) {
        if (query[field] === undefined) {
          return `${field} is required`
        }
      }
      if (!currency) {
        return 'currency is required'
      }

      // 取得 user 的所有 balance
      const balances = await strapi.entityService.findMany(
        'api::balance.balance',
        {
          filters: {
            user: query.user_id,
          },
          populate: {
            amount_type: {
              fields: ['slug'],
            },
          },
        }
      )

      const findBalance = balances.find(
        (balance) => balance.currency === currency
      )

      // 沒有 balance 就新增初始值 0
      if (!findBalance) {
        const createBalanceResult = await strapi.entityService.create(
          'api::balance.balance',
          {
            data: {
              amount: 0,
              user: query.user_id,
              currency,
              amount_type: 1, // CASH
            },
          }
        )
        balances.push(createBalanceResult)
      }

      const formattedBalances = balances.map((balance) => {
        return {
          ...balance,
          amount: balance.amount.toString(),
          amount_type:
            balance?.amount_type?.slug ||
            process.env?.DEFAULT_AMOUNT_TYPE ||
            'CASH',
          currency: balance.currency,
        }
      })

      return formattedBalances
    } catch (err) {
      return err
    }
  },
})
