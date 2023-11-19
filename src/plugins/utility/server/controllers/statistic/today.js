'use strict'
const dayjs = require('dayjs')
const default_currency = 'KRW'
const default_amount_type = 'CASH'

module.exports = async (ctx) => {
  const query = ctx.request.query
  const currency = query?.currency || default_currency
  const amount_type = query?.amount_type || default_amount_type
  const UTC9toUTC0 = global.appData.UTC9toUTC0
  const start = UTC9toUTC0(dayjs().startOf('day'))

  // start: 2023-11-04 00:00:00.000000

  const end = UTC9toUTC0(dayjs().endOf('day'))

  // end: 2023-11-04 23:59:59.999999

  const user = ctx?.state?.user
  const roleType = user?.role?.type
  const agent_id = roleType === 'agent' ? user?.id : undefined

  // TABLE 1

  // deposit
  const dpSuccessTxns = await strapi.entityService.findMany(
    'api::transaction-record.transaction-record',
    {
      fields: ['id', 'amount'],
      filters: {
        type: 'DEPOSIT',
        status: 'SUCCESS',
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
      populate: {
        user: {
          fields: ['id'],
          populate: {
            agent: {
              fields: ['id'],
            },
          },
        },
      },
    }
  )

  const filteredDpSuccessTxns = dpSuccessTxns.filter((t) => {
    if (agent_id) {
      return t?.user?.agent?.id === agent_id
    }
    return true
  })
  const dpAmount = filteredDpSuccessTxns.reduce((acc, cur) => {
    acc += cur.amount
    return acc
  }, 0)
  const dpUserIds = filteredDpSuccessTxns.map((txn) => txn?.user?.id)
  const uniqueDpUserIds = Array.from(new Set(dpUserIds))
  const dpUsers = uniqueDpUserIds.length

  // withdraw
  const wdSuccessTxns = await strapi.entityService.findMany(
    'api::transaction-record.transaction-record',
    {
      fields: ['id', 'amount'],
      filters: {
        type: 'WITHDRAW',
        status: 'SUCCESS',
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
      populate: {
        user: {
          fields: ['id'],
          populate: {
            agent: {
              fields: ['id'],
            },
          },
        },
      },
    }
  )

  const filteredWdSuccessTxns = wdSuccessTxns.filter((t) => {
    if (agent_id) {
      return t?.user?.agent?.id === agent_id
    }
    return true
  })
  const wdAmount = filteredWdSuccessTxns.reduce((acc, cur) => {
    acc += cur.amount
    return acc
  }, 0)
  const wdUserIds = filteredWdSuccessTxns.map((txn) => txn?.user?.id)
  const uniqueWdUserIds = Array.from(new Set(wdUserIds))
  const wdUsers = uniqueWdUserIds.length

  // dpWd
  const dpWd = dpAmount + wdAmount

  const allCashBalances = await strapi.entityService.findMany(
    'api::balance.balance',
    {
      fields: ['amount'],
      filters: {
        currency,
        amount_type,
        amount: { $ne: 0 },
      },
      populate: {
        user: {
          fields: ['id'],
          populate: {
            agent: {
              fields: ['id'],
            },
          },
        },
      },
    }
  )
  const filteredCashBalances = allCashBalances.filter((b) => {
    if (agent_id) {
      return b?.user?.agent?.id === agent_id
    }
    return true
  })
  const cashBalanceAmount = filteredCashBalances.reduce(
    (acc, curr) => acc + curr.amount,
    0
  )

  const allTurnoverBonusBalances = await strapi.entityService.findMany(
    'api::balance.balance',
    {
      fields: ['amount'],
      filters: {
        currency,
        amount_type: 'TURNOVER_BONUS',
        amount: { $ne: 0 },
      },
      populate: {
        user: {
          fields: ['id'],
          populate: {
            agent: {
              fields: ['id'],
            },
          },
        },
      },
    }
  )
  const filteredTurnoverBonusBalances = allTurnoverBonusBalances.filter((b) => {
    if (agent_id) {
      return b?.user?.agent?.id === agent_id
    }
    return true
  })
  const turnoverBonusBalanceAmount = filteredTurnoverBonusBalances.reduce(
    (acc, curr) => acc + curr.amount,
    0
  )

  const table1 = {
    cashBalanceAmount,
    turnoverBonusBalanceAmount,
    dpAmount,
    dpUsers,
    wdAmount,
    wdUsers,
    dpWd,
  }

  // TABLE 2

  const bettingRecords = await strapi.entityService.findMany(
    'api::bet-record.bet-record',
    {
      filters: {
        updatedAt: {
          $gte: start,
          $lte: end,
        },
      },
      populate: {
        user: {
          fields: ['id'],
          populate: {
            agent: {
              fields: ['id'],
            },
          },
        },
      },
      sort: { createdAt: 'desc' },
    }
  )

  const filteredBettingRecords = bettingRecords.filter((t) => {
    if (agent_id) {
      return t?.user?.agent?.id === agent_id
    }
    return true
  })

  function getGPCashAmount(game_provider, records, field) {
    if (game_provider === 'ALL') {
      return records.reduce((acc, cur) => {
        acc += cur?.[field]
        return acc
      }, 0)
    }
    const amount = records
      .filter((r) => r.by === game_provider)
      .reduce((acc, cur) => {
        acc += cur?.[field]
        return acc
      }, 0)
    return amount
  }

  function getGPWinLoss(game_provider) {
    const amount =
      (getGPCashAmount(game_provider, filteredBettingRecords, 'credit_amount') +
        getGPCashAmount(
          game_provider,
          filteredBettingRecords,
          'debit_amount'
        )) *
      -1
    return amount
  }

  function getGPUserCount(game_provider, records) {
    if (game_provider === 'ALL') {
      const user_ids = records.map((r) => r?.user?.id)
      const unique_user_ids = Array.from(new Set(user_ids))

      return unique_user_ids.length
    }
    const user_ids = records
      .filter((r) => r.by === game_provider)
      .map((r) => r?.user?.id)
    const unique_user_ids = Array.from(new Set(user_ids))

    return unique_user_ids.length
  }

  const turnoverBonusTxns = await strapi.entityService.findMany(
    'api::transaction-record.transaction-record',
    {
      fields: ['id', 'amount'],
      filters: {
        type: 'COUPON',
        amount_type: 'TURNOVER_BONUS',
        status: 'SUCCESS',
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
      populate: {
        user: {
          fields: ['id'],
          populate: {
            agent: {
              fields: ['id'],
            },
          },
        },
      },
    }
  )

  const filteredTurnoverBonusTxns = turnoverBonusTxns.filter((t) => {
    if (agent_id) {
      return t?.user?.agent?.id === agent_id
    }
    return true
  })

  function getGPTurnoverBonusAmount(game_provider, txns) {
    if (game_provider === 'ALL') {
      return txns.reduce((acc, cur) => {
        acc += cur.amount
        return acc
      }, 0)
    }

    const amount = txns
      .filter((r) => r.by === game_provider)
      .reduce((acc, cur) => {
        acc += cur.amount
        return acc
      }, 0)
    return amount
  }

  // ⚠️⚠️⚠️這個改的話，FE前端也要改
  const EVO = 'EVO'
  const BTI = 'bti-api'
  const PP = 'PP'
  const TOKEN = 'TOKENGP'
  const IGX = 'IGX'

  const table2 = [
    {
      label: 'bet amount(users)',
      total:
        getGPCashAmount('ALL', filteredBettingRecords, 'debit_amount') * -1,
      evo: getGPCashAmount(EVO, filteredBettingRecords, 'debit_amount') * -1,
      pp: getGPCashAmount(PP, filteredBettingRecords, 'debit_amount') * -1,
      bti: getGPCashAmount(BTI, filteredBettingRecords, 'debit_amount') * -1,
      igx: getGPCashAmount(IGX, filteredBettingRecords, 'debit_amount') * -1,
      token:
        getGPCashAmount(TOKEN, filteredBettingRecords, 'debit_amount') * -1,
    },
    {
      label: 'bet users',
      total: getGPUserCount('ALL', filteredBettingRecords),
      evo: getGPUserCount(EVO, filteredBettingRecords),
      pp: getGPUserCount(PP, filteredBettingRecords),
      bti: getGPUserCount(BTI, filteredBettingRecords),
      igx: getGPUserCount(IGX, filteredBettingRecords),
      token: getGPUserCount(TOKEN, filteredBettingRecords),
    },
    {
      label: 'payout',
      total:
        getGPCashAmount('ALL', filteredBettingRecords, 'credit_amount') * -1,
      evo: getGPCashAmount(EVO, filteredBettingRecords, 'credit_amount') * -1,
      pp: getGPCashAmount(PP, filteredBettingRecords, 'credit_amount') * -1,
      bti: getGPCashAmount(BTI, filteredBettingRecords, 'credit_amount') * -1,
      igx: getGPCashAmount(IGX, filteredBettingRecords, 'credit_amount') * -1,
      token:
        getGPCashAmount(TOKEN, filteredBettingRecords, 'credit_amount') * -1,
    },
    {
      label: 'winloss',
      total: getGPWinLoss('ALL'),
      evo: getGPWinLoss(EVO),
      pp: getGPWinLoss(PP),
      bti: getGPWinLoss(BTI),
      igx: getGPWinLoss(IGX),
      token: getGPWinLoss(TOKEN),
    },
    {
      label: 'turnover bonus',
      total: getGPTurnoverBonusAmount('ALL', filteredTurnoverBonusTxns),
      evo: getGPTurnoverBonusAmount(EVO, filteredTurnoverBonusTxns),
      pp: getGPTurnoverBonusAmount(PP, filteredTurnoverBonusTxns),
      bti: getGPTurnoverBonusAmount(BTI, filteredTurnoverBonusTxns),
      igx: getGPTurnoverBonusAmount(IGX, filteredTurnoverBonusTxns),
      token: getGPTurnoverBonusAmount(TOKEN, filteredTurnoverBonusTxns),
    },
  ]

  // TABLE 3
  const dpPendingTxns = await strapi.entityService.findMany(
    'api::transaction-record.transaction-record',
    {
      fields: ['id'],
      filters: {
        type: 'DEPOSIT',
        status: 'PENDING',
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
      populate: {
        user: {
          fields: ['id'],
          populate: {
            agent: {
              fields: ['id'],
            },
          },
        },
      },
    }
  )
  const filteredDpPendingTxns = dpPendingTxns.filter((t) => {
    if (agent_id) {
      return t?.user?.agent?.id === agent_id
    }
    return true
  })

  const wpPendingTxns = await strapi.entityService.findMany(
    'api::transaction-record.transaction-record',
    {
      fields: ['id'],
      filters: {
        type: 'WITHDRAW',
        status: 'PENDING',
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
      populate: {
        user: {
          fields: ['id'],
          populate: {
            agent: {
              fields: ['id'],
            },
          },
        },
      },
    }
  )
  const filteredWpPendingTxns = wpPendingTxns.filter((t) => {
    if (agent_id) {
      return t?.user?.agent?.id === agent_id
    }
    return true
  })

  const registeredUsers = await strapi.entityService.findMany(
    'plugin::users-permissions.user',
    {
      fields: ['id', 'confirmed'],
      filters: {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
      populate: {
        agent: {
          fields: ['id'],
        },
      },
    }
  )
  const filteredRegisteredUsers = registeredUsers.filter((u) => {
    if (agent_id) {
      return u?.agent?.id === agent_id
    }
    return true
  })

  const table3 = [
    {
      label: 'deposit',
      pending: filteredDpPendingTxns.length,
      confirmed: filteredDpPendingTxns.length,
    },
    {
      label: 'withdraw',
      pending: filteredWpPendingTxns.length,
      confirmed: filteredWpPendingTxns.length,
    },
    {
      label: 'register',
      pending: filteredRegisteredUsers.filter((u) => !u.confirmed).length,
      confirmed: filteredRegisteredUsers.filter((u) => !!u.confirmed).length,
    },
  ]

  // TABLE 4

  const allRegisteredUsers = await strapi.entityService.findMany(
    'plugin::users-permissions.user',
    {
      fields: ['id'],
      populate: {
        agent: {
          fields: ['id'],
        },
      },
    }
  )
  const filteredAllRegisteredUsers = allRegisteredUsers.filter((u) => {
    if (agent_id) {
      return u?.agent?.id === agent_id
    }
    return true
  })

  const table4 = [
    {
      label: 'total_users',
      count: filteredAllRegisteredUsers.length,
    },
    {
      label: 'online_users',
      count: '-', // TODO
    },
  ]

  ctx.body = {
    status: '200',
    message: 'get statistic/today success',
    data: {
      table1,
      table2,
      table3,
      table4,
    },
  }
}
