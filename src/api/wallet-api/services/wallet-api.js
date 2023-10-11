'use strict'
const differenceBy = require('lodash/differenceBy')
const cloneDeep = require('lodash/cloneDeep')
const uniqBy = require('lodash/uniqBy')
/**
 * wallet-api service
 */

async function handleBalances(balances, user_id) {
  const newBalances = cloneDeep(balances)
  const siteSetting = global.appData.siteSetting
  const defaultCurrency = siteSetting?.default_currency
  const support_currencies = siteSetting?.support_currencies || [
    defaultCurrency,
  ]
  const support_amount_types = siteSetting?.support_amount_types || []
  const allTypes = support_currencies
    .map((c) => {
      return support_amount_types.map((t) => {
        return {
          currency: c,
          amount_type: t,
        }
      })
    })
    .flat()

  const currentTypes = newBalances.map((b) => ({
    currency: b.currency,
    amount_type: b.amount_type,
  }))
  const uniqueCurrentTypes = uniqBy(currentTypes, (c) => {
    return `${c.currency}-${c.amount_type}`
  })

  // 判斷目前 Balance 與網站 support 的幣別 & amount type 差異
  const diff =
    differenceBy(allTypes, uniqueCurrentTypes, (t) => {
      return `${t.currency}-${t.amount_type}`
    }) || []

  if (diff.length === 0 || !diff) return newBalances

  const createdBalances = await Promise.all(
    diff.map(async (d) => {
      const createResult = await strapi.entityService.create(
        'api::balance.balance',
        {
          data: {
            amount: 0,
            user: user_id,
            currency: d.currency,
            amount_type: d.amount_type,
          },
        }
      )
      return createResult
    })
  )

  return [...newBalances, ...createdBalances]
}

module.exports = () => ({
  // addBalance 僅更新 balance ，不會創建 transaction record
  addBalance: async (body) => {
    // 取得幣別
    const siteSetting = global.appData.siteSetting
    const defaultCurrency = siteSetting?.default_currency
    const defaultAmountType = siteSetting?.default_amount_type || 'CASH'
    const amount_type = body?.amount_type || defaultAmountType

    const currency =
      (body?.currency || '').toUpperCase() || defaultCurrency || null

    const balances =
      (await strapi.entityService.findMany('api::balance.balance', {
        filters: {
          user: body.user_id,
        },
      })) || []

    // 如果沒有 支援幣別 & amount type 的 balance 就新增初始值 0
    const allBalances = await handleBalances(balances, body.user_id)

    const findBalance = allBalances.find(
      (b) => b.currency === currency && b.amount_type === amount_type
    )

    // 計算修改後的 balance
    const newBalance = Number(findBalance?.amount || 0) + Number(body.amount)

    // 預防用戶金額不夠扣
    const allowNegative = body?.allowNegative ?? false

    if (newBalance < 0 && !allowNegative) {
      return 'Insufficient balance'
    }

    // 更新 balance
    return await strapi.db.transaction(
      async ({ trx, rollback, commit, onCommit, onRollback }) => {
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
        if (updateResult?.id) {
          return updateResult
        } else {
          throw new Error(
            `update balance failed ${JSON.stringify(updateResult)}`
          )
        }
      }
    )
  },
  // add 除了更新 balance 之外，還會創建一筆 transaction record
  add: async (body) => {
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
        throw new Error(`${field} is required`)
      }
    }

    const updateResult = await strapi
      .service('api::wallet-api.wallet-api')
      .addBalance(body)

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
          amount_type: updateResult?.amount_type,
          currency: updateResult?.currency,
          by: body.by,
          user: body.user_id, // connect
          bet_record: body.bet_record_id, // connect
          status: updateResult?.id ? 'SUCCESS' : 'FAILED',
          balance_after_mutate: updateResult?.id ? updateResult?.amount : null,
        },
      }
    )

    const userBalances = await strapi.entityService.findMany(
      'api::balance.balance',
      {
        filters: {
          user: body.user_id,
        },
      }
    )
    const formattedUserBalances = userBalances.map((balance) => ({
      ...balance,
      amount: balance.amount.toString(),
      amount_type: balance?.amount_type,
      currency: balance.currency,
    }))

    const result = {
      result: createTxnResult,
      balances: formattedUserBalances,
    }

    return result
  },
  get: async (query) => {
    const siteSetting = global.appData.siteSetting
    const defaultCurrency = siteSetting?.default_currency
    const support_currencies = siteSetting?.support_currencies || [
      defaultCurrency,
    ]
    const support_amount_types = siteSetting?.support_amount_types || []

    const defaultAmountType = siteSetting?.default_amount_type || 'CASH'

    const currency = query?.currency || defaultCurrency || null
    const amount_type = query?.amount_type || defaultAmountType

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
      }
    )

    // 如果沒有 支援幣別 & amount type 的 balance 就新增初始值 0
    const allBalances = await handleBalances(balances, query.user_id)

    const formattedBalances = allBalances.map((balance) => {
      return {
        ...balance,
        amount: balance.amount.toString(),
        amount_type: balance?.amount_type,
        currency: balance.currency,
      }
    })

    // 如果有帶搜尋條件 TODO 就只抓該條件的 balance

    return formattedBalances
  },
  withdraw: async (body) => {
    // 只做創建 transaction record 狀態=PENDING
    // afterUpdate 且 狀態=APPROVED 才做 balance 的更新

    // 如果沒有帶參數就回 400
    const requiredFields = ['amount', 'user_id']

    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return `${field} is required`
      }
    }

    // 取得幣別
    const siteSetting = global.appData.siteSetting
    const defaultCurrency = siteSetting?.default_currency
    const defaultAmountType = siteSetting?.default_amount_type || 'CASH'

    const currency =
      (body?.currency || '').toUpperCase() || defaultCurrency || null
    const amount_type = body?.amount_type || defaultAmountType

    const balances =
      (await strapi.entityService.findMany('api::balance.balance', {
        filters: {
          user: body.user_id,
        },
      })) || []

    // 如果沒有 支援幣別 & amount type 的 balance 就新增初始值 0
    const allBalances = await handleBalances(balances, body.user_id)
    const findBalance = allBalances.find(
      (b) => b.currency === currency && b.amount_type === amount_type
    )

    // 計算修改後的 balance
    const newBalance = Number(findBalance?.amount || 0) - Number(body.amount)

    // 預防用戶金額不夠領
    if (Number(body.amount) < 0) {
      return "amount can't < 0"
    }
    if (newBalance < 0) {
      return 'Insufficient balance'
    }

    /**
     * @ref https://docs.strapi.io/dev-docs/api/entity-service/crud#create
     * 創建一筆 Transaction Record
     */

    const createTxnResult = await strapi.entityService.create(
      'api::transaction-record.transaction-record',
      {
        data: {
          type: 'WITHDRAW',
          title: `user_id #${body.user_id} withdraw $${Math.abs(
            body.amount
          ).toLocaleString()} ${currency}`,
          description: '',
          amount: Math.abs(body?.amount || 0) * -1,
          currency,
          amount_type,
          by: 'USER',
          user: body.user_id, // connect
          status: 'PENDING',
        },
      }
    )
    return createTxnResult
  },
})
