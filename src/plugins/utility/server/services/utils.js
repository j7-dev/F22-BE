'use strict'

const differenceBy = require('lodash/differenceBy')
const cloneDeep = require('lodash/cloneDeep')
const uniqBy = require('lodash/uniqBy')
const intersection = require('lodash/intersection')

// 如果 value 是 undefined，则删除该 key
const removeUndefinedKeys = (obj) => {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key]
    } else if (typeof obj[key] === 'object') {
      removeUndefinedKeys(obj[key]) // 递归处理嵌套对象
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key]
      }
    }
  }

  return obj
}

// 依照日期區間拆分
const countByDate = ({ startD, endD }) => {
  const diff = endD.diff(startD, 'day') + 1

  const data = new Array(diff).fill(0).map((item, index) => {
    return {
      startD: index === 0 ? startD : startD.add(index, 'day').startOf('day'),
      endD: index === diff - 1 ? endD : startD.add(index, 'day').endOf('day'),
    }
  })

  return data
}
const handleBalances = async (balances, user_id) => {
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

  // 判斷目前 uniqueCurrentTypes 是否包含 allTypes
  const isInclude =
    intersection(allTypes, uniqueCurrentTypes).length === allTypes.length

  if (isInclude) return newBalances

  // 判斷目前 Balance 與網站 support 的幣別 & amount type 差異
  const diff =
    differenceBy(allTypes, uniqueCurrentTypes, (t) => {
      return `${t.currency}-${t.amount_type}`
    }) || []

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

module.exports = {
  removeUndefinedKeys,
  countByDate,
  handleBalances,
}
