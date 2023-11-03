'use strict'
const { countByDate } = require('../services/utils')
const { removeUndefinedKeys } = require('../services/utils')
const dayjs = require('dayjs')
const default_currency = 'KRW'
const default_amount_type = 'CASH'

module.exports = ({ strapi }) => ({
  async recent(ctx) {
    const query = ctx.request.query
    const currency = query?.currency || default_currency
    const amount_type = query?.amount_type || default_amount_type
    const dateArr =
      countByDate({
        startD: dayjs(query?.start),
        endD: dayjs(query?.end),
      }) || []

    // const winLossRatio = await Promise.all(
    //   dateArr.map(async (dateItem) => {
    //     const value = await strapi
    //       .service('plugin::utility.bettingAmount')
    //       .getWinLossRatio({
    //         start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
    //         end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
    //       })

    //     const payload = {
    //       date: dateItem.startD.format('YYYY/MM/DD (dd)'),
    //       value,
    //     }
    //     return payload
    //   })
    // )

    const dpWd = await Promise.all(
      dateArr.map(async (dateItem) => {
        const value = await strapi.service('plugin::utility.dpWd').getDpWd({
          currency,
          amount_type,
          start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        })

        const payload = {
          date: dateItem.startD.format('YYYY/MM/DD (dd)'),
          value,
        }
        return payload
      })
    )

    const validBet = await Promise.all(
      dateArr.map(async (dateItem) => {
        const value = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            currency,
            amount_type,
            start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          })

        const payload = {
          date: dateItem.startD.format('YYYY/MM/DD (dd)'),
          value,
        }
        return payload
      })
    )

    // const bettingAmount = await Promise.all(
    //   dateArr.map(async (dateItem) => {
    //     const value = await strapi
    //       .service('plugin::utility.bettingAmount')
    //       .get({
    //         currency,
    //         start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
    //         end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
    //       })

    //     const payload = {
    //       date: dateItem.startD.format('YYYY/MM/DD (dd)'),
    //       value,
    //     }
    //     return payload
    //   })
    // )

    const numberOfRegistrants = await Promise.all(
      dateArr.map(async (dateItem) => {
        const value = await strapi.entityService.findMany(
          'plugin::users-permissions.user',
          {
            fields: ['id'],
            filters: {
              createdAt: {
                $gte: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
                $lte: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
              },
            },
          }
        )

        const payload = {
          date: dateItem.startD.format('YYYY/MM/DD (dd)'),
          value: value.length,
        }
        return payload
      })
    )

    const onlineMembers = await Promise.all(
      dateArr.map(async (dateItem) => {
        const value = await strapi
          .service('plugin::utility.members')
          .getOnlineMembers({
            start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          })

        const payload = {
          date: dateItem.startD.format('YYYY/MM/DD (dd)'),
          value,
        }
        return payload
      })
    )

    const totalDeposit = await Promise.all(
      dateArr.map(async (dateItem) => {
        const value = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: 'DEPOSIT',
            currency,
            amount_type,
            start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          })

        const payload = {
          date: dateItem.startD.format('YYYY/MM/DD (dd)'),
          value,
        }
        return payload
      })
    )

    const data = {
      // winLossRatio,
      dpWd,
      validBet,
      // bettingAmount,
      numberOfRegistrants,
      onlineMembers,
      totalDeposit,
    }

    ctx.body = {
      status: '200',
      message: 'get statistic/recent success',
      data,
    }
  },
  async important(ctx) {
    const query = ctx.request.query
    const currency = query?.currency || default_currency
    const amount_type = query?.amount_type || default_amount_type
    const dateArr = [
      {
        // today
        label: 'today',
        start: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        end: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      },
      {
        // yesterday
        label: 'yesterday',
        start: dayjs()
          .subtract(1, 'day')
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        end: dayjs()
          .subtract(1, 'day')
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      },
      {
        // this week
        label: 'thisWeek',
        start: dayjs().startOf('week').format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        end: dayjs().endOf('week').format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      },
      {
        // last week
        label: 'lastWeek',
        start: dayjs()
          .subtract(1, 'week')
          .startOf('week')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        end: dayjs()
          .subtract(1, 'week')
          .endOf('week')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      },
      {
        // this month
        label: 'thisMonth',
        start: dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        end: dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      },
      {
        // last month
        label: 'lastMonth',
        start: dayjs()
          .subtract(1, 'month')
          .startOf('month')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        end: dayjs()
          .subtract(1, 'month')
          .endOf('month')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
      },
    ]

    const getMembersByRoleAndDate = async (args) => {
      const roleType = args?.roleType
      const countType = args?.countType
      const format = args?.format
      const populate = args?.populate || []

      const resultArr = await Promise.all(
        dateArr.map(async (dateItem) => {
          const createdAt =
            countType === 'TOTAL' // 計算累積
              ? {
                  $lte: dateItem.end,
                }
              : {
                  $gte: dateItem.start,
                  $lte: dateItem.end,
                }

          const default_where = {
            role: {
              type: roleType,
            },
            createdAt,
          }

          const [entities, count] = await strapi.db
            .query('plugin::users-permissions.user')
            .findWithCount({
              select: ['id'],
              where: removeUndefinedKeys(default_where),
              populate,
            })

          const value = format
            ? format === 'COUNT'
              ? count
              : format(entities)
            : entities

          const payload = {
            key: dateItem.label,
            value,
          }
          return payload
        })
      )

      const resultObj = resultArr.reduce((acc, cur) => {
        acc[cur.key] = cur.value
        return acc
      }, {})

      return resultObj
    }

    const allNewUsers = await getMembersByRoleAndDate({
      populate: {
        role: {
          select: ['id', 'type'],
        },
      },
    })

    const agentInfo_newTopAgent = Object.keys(allNewUsers).reduce(
      (acc, key) => {
        const user_ids = allNewUsers[key]
          .filter((user) => user?.role?.type === 'top_agent')
          .map((user) => user?.id)
        acc[key] = user_ids.length
        return acc
      },
      {}
    )

    const agentInfo_newAgent = Object.keys(allNewUsers).reduce((acc, key) => {
      const user_ids = allNewUsers[key]
        .filter((user) => user?.role?.type === 'agent')
        .map((user) => user?.id)
      acc[key] = user_ids.length
      return acc
    }, {})

    const newMembers_newMembers = Object.keys(allNewUsers).reduce(
      (acc, key) => {
        const user_ids = allNewUsers[key]
          .filter((user) => user?.role?.type === 'authenticated')
          .map((user) => user?.id)
        acc[key] = user_ids.length
        return acc
      },
      {}
    )

    const getTxnByDate = async (args) => {
      const type = args?.type
      const countType = args?.countType
      const format = args?.format
      const status = args?.status || 'SUCCESS'

      const resultArr = await Promise.all(
        dateArr.map(async (dateItem) => {
          const createdAt =
            countType === 'total'
              ? {
                  $lte: dateItem.end,
                }
              : {
                  $gte: dateItem.start,
                  $lte: dateItem.end,
                }

          const populate =
            countType === 'NEW_USER'
              ? {
                  user: {
                    select: ['id'],
                    where: {
                      createdAt,
                    },
                  },
                }
              : {
                  user: {
                    select: ['id'],
                  },
                }

          const [entities, count] = await strapi.db
            .query('api::transaction-record.transaction-record')
            .findWithCount({
              select: '*',
              where: {
                type,
                status,
                amount_type,
                createdAt,
              },
              populate,
            })

          const value = format
            ? format === 'COUNT'
              ? count
              : format(entities)
            : entities

          const payload = {
            key: dateItem.label,
            value,
          }
          return payload
        })
      )

      const resultObj = resultArr.reduce((acc, cur) => {
        acc[cur.key] = cur.value
        return acc
      }, {})

      return resultObj
    }

    const debitTxns = await getTxnByDate({
      type: 'DEBIT',
      status: 'SUCCESS',
    })

    const turnoverInfo_total = Object.keys(debitTxns).reduce((acc, key) => {
      const value = debitTxns[key].reduce((a, c) => {
        a += c.amount
        return a
      }, 0)
      acc[key] = value
      return acc
    }, {})

    const turnoverInfo_totalMember = Object.keys(debitTxns).reduce(
      (acc, key) => {
        const user_ids = debitTxns[key].map((txn) => txn?.user?.id)
        const unique_user_ids = Array.from(new Set(user_ids))
        acc[key] = unique_user_ids.length
        return acc
      },
      {}
    )

    // TODO bettingInfo
    const bettingInfo_validBetAmount = await getTxnByDate({
      type: 'DEBIT',
      amount_type,
      format: (entities) => {
        const totalAmount = entities.reduce((acc, cur) => {
          acc += cur.amount
          return acc
        }, 0)

        return totalAmount
      },
    })

    // Deposit info
    const depositTxns = await getTxnByDate({
      type: 'DEPOSIT',
      status: 'SUCCESS',
      amount_type,
    })

    const newMembers_amountForDepositMembers = Object.keys(depositTxns).reduce(
      (acc, key) => {
        const new_user_ids = allNewUsers[key].map((user) => user?.id)

        const new_user_deposits = depositTxns?.[key]?.filter((txn) =>
          new_user_ids.includes(txn?.user?.id)
        )

        const amount = new_user_deposits.reduce((a, c) => {
          a += c.amount
          return a
        }, 0)
        acc[key] = amount
        return acc
      },
      {}
    )

    const depositInfo_total = Object.keys(depositTxns).reduce((acc, key) => {
      const value = depositTxns[key].reduce((a, c) => {
        a += c.amount
        return a
      }, 0)
      acc[key] = value
      return acc
    }, {})

    const depositInfo_totalMember = Object.keys(depositTxns).reduce(
      (acc, key) => {
        const user_ids = depositTxns[key].map((txn) => txn?.user?.id)
        const unique_user_ids = Array.from(new Set(user_ids))
        acc[key] = unique_user_ids.length
        return acc
      },
      {}
    )

    const depositInfo_totalQty = Object.keys(depositTxns).reduce((acc, key) => {
      const countTxns = depositTxns[key].length
      acc[key] = countTxns
      return acc
    }, {})

    // Withdraw info
    const withdrawTxns = await getTxnByDate({
      type: 'WITHDRAW',
      status: 'SUCCESS',
      amount_type,
    })

    const withdrawInfo_total = Object.keys(withdrawTxns).reduce((acc, key) => {
      const value = withdrawTxns[key].reduce((a, c) => {
        a += c.amount
        return a
      }, 0)
      acc[key] = value
      return acc
    }, {})

    const withdrawInfo_totalMember = Object.keys(withdrawTxns).reduce(
      (acc, key) => {
        const user_ids = withdrawTxns[key].map((txn) => txn?.user?.id)
        const unique_user_ids = Array.from(new Set(user_ids))
        acc[key] = unique_user_ids.length
        return acc
      },
      {}
    )

    const withdrawInfo_totalQty = Object.keys(withdrawTxns).reduce(
      (acc, key) => {
        const countTxns = withdrawTxns[key].length
        acc[key] = countTxns
        return acc
      },
      {}
    )

    const data = {
      agentInfo_newTopAgent,
      agentInfo_newAgent,
      newMembers_newMembers,
      newMembers_amountForDepositMembers,
      turnoverInfo_total,
      turnoverInfo_totalMember, // 有投注的人數
      bettingInfo_validBetAmount,
      bettingInfo_winLoss: 0, // TODO
      depositInfo_total,
      depositInfo_totalMember,
      depositInfo_totalQty,
      withdrawInfo_total,
      withdrawInfo_totalMember,
      withdrawInfo_totalQty,
    }

    ctx.body = {
      status: '200',
      message: 'get statistic/important success',
      data,
    }
  },
  async daily(ctx) {
    const query = ctx.request.query
    const currency = query?.currency || default_currency
    const amount_type = query?.amount_type || default_amount_type
    const dateArr =
      countByDate({
        startD: dayjs(query?.start),
        endD: dayjs(query?.end),
      }) || []

    const dataSource = await Promise.all(
      dateArr.map(async (dateItem) => {
        const dpWd = await strapi.service('plugin::utility.dpWd').getDpWd({
          currency,
          amount_type,
          start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
        })

        const deposit = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: 'DEPOSIT',
            currency,
            amount_type,
            start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          })

        const withdraw = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: 'WITHDRAW',
            currency,
            amount_type,
            start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          })

        // 抓取有效投注
        const validBet = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: 'DEBIT',
            currency,
            amount_type,
            start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          })

        // payout = 中獎金額，CREDIT且 金額為正數，但CREDIT本身應該就不會負數
        const payout = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: 'CREDIT',
            currency,
            amount_type,
            start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          })

        // 紅利+洗碼
        const coupon = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: 'COUPON',
            currency,
            amount_type,
            start: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            end: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
          })

        //新註冊人數
        const getRegisterUsersResult = await strapi.entityService.findMany(
          'plugin::users-permissions.user',
          {
            fields: ['id'],
            filters: {
              createdAt: {
                $gte: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
                $lte: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
              },
            },
          }
        )
        const numberOfRegistrantUserIds = getRegisterUsersResult.map(
          (item) => item?.id
        )
        const uniqueNumberOfRegistrantUserIds = Array.from(
          new Set(numberOfRegistrantUserIds)
        )
        const numberOfRegistrants = uniqueNumberOfRegistrantUserIds.length

        const debitTxns = await strapi.entityService.findMany(
          'api::transaction-record.transaction-record',
          {
            fields: ['id'],
            populate: {
              user: {
                fields: ['id'],
              },
            },
            filters: {
              createdAt: {
                $gte: dateItem.startD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
                $lte: dateItem.endD.format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
              },
            },
          }
        )
        const debitTxnUserIds = debitTxns.map((txn) => txn?.user?.id)
        const uniqueDebitTxnUserIds = Array.from(new Set(debitTxnUserIds))
        const bettingMembers = uniqueDebitTxnUserIds.length

        const payload = {
          date: dateItem.startD.format('YYYY/MM/DD (dd)'),
          deposit,
          withdraw,
          dpWd,
          validBet,
          payout: payout * -1, // 顯示為負數
          winloss: validBet - payout,
          coupon,
          profit: validBet - payout - coupon,
          numberOfRegistrants,
          bettingMembers,
        }
        return payload
      })
    )

    ctx.body = {
      status: '200',
      message: 'get statistic/daily success',
      data: dataSource,
    }
  },
  async today(ctx) {
    const query = ctx.request.query
    const currency = query?.currency || default_currency
    const amount_type = query?.amount_type || default_amount_type
    const start = dayjs().startOf('year').format('YYYY-MM-DD HH:mm:ss.SSSSSS')
    const end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss.SSSSSS')

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
          },
        },
      }
    )

    const dpAmount = dpSuccessTxns.reduce((acc, cur) => {
      acc += cur.amount
      return acc
    }, 0)
    const dpUserIds = dpSuccessTxns.map((txn) => txn?.user?.id)
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
          },
        },
      }
    )

    const wdAmount =
      wdSuccessTxns.reduce((acc, cur) => {
        acc += cur.amount
        return acc
      }, 0) * -1
    const wdUserIds = wdSuccessTxns.map((txn) => txn?.user?.id)
    const uniqueWdUserIds = Array.from(new Set(wdUserIds))
    const wdUsers = uniqueWdUserIds.length

    // dpWd
    const dpWd = dpAmount - wdAmount

    const allCashBalances = await strapi.entityService.findMany(
      'api::balance.balance',
      {
        fields: ['amount'],
        filters: { currency, amount_type, amount: { $ne: 0 } },
      }
    )
    const cashBalanceAmount = allCashBalances.reduce(
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
      }
    )
    const turnoverBonusBalanceAmount = allTurnoverBonusBalances.reduce(
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

    const bettingRecords = await strapi
      .service('plugin::utility.bettingRecords')
      .get({
        startTime: start,
        endTime: end,
      })

    const debitRecords = bettingRecords.filter((r) => r.status === 'DEBIT')
    const creditRecords = bettingRecords.filter((r) => r.status === 'CREDIT')

    function getGPCashAmount(game_provider, records) {
      if (game_provider === 'ALL') {
        return records.reduce((acc, cur) => {
          acc += cur.amount
          return acc
        }, 0)
      }
      const amount = records
        .filter((r) => r.game_provider === game_provider)
        .reduce((acc, cur) => {
          acc += cur.amount
          return acc
        }, 0)
      return amount
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
          meta: '*',
        },
      }
    )

    function getGPTurnoverBonusAmount(game_provider, txns) {
      if (game_provider === 'ALL') {
        return txns.reduce((acc, cur) => {
          acc += cur.amount
          return acc
        }, 0)
      }
      const gpTxns = turnoverBonusTxns.filter((r) =>
        r?.meta.some(
          (m) =>
            m.meta_key === 'game_provider' && m.meta_value === game_provider
        )
      )
      const amount = gpTxns.reduce((acc, cur) => {
        acc += cur.amount
        return acc
      }, 0)
      return amount
    }

    const table2 = [
      {
        label: 'bet amount(users)',
        total: getGPCashAmount('ALL', debitRecords),
        evo: getGPCashAmount('EVO', debitRecords),
        pp: getGPCashAmount('PP', debitRecords),
        bti: getGPCashAmount('BTI', debitRecords),
        igx: getGPCashAmount('IGX', debitRecords),
      },
      {
        label: 'payout',
        total: getGPCashAmount('ALL', creditRecords) * -1,
        evo: getGPCashAmount('EVO', creditRecords) * -1,
        pp: getGPCashAmount('PP', creditRecords) * -1,
        bti: getGPCashAmount('BTI', creditRecords) * -1,
        igx: getGPCashAmount('IGX', creditRecords) * -1,
      },
      {
        label: 'winloss',
        total:
          getGPCashAmount('ALL', debitRecords) -
          getGPCashAmount('ALL', creditRecords),
        evo:
          getGPCashAmount('EVO', debitRecords) -
          getGPCashAmount('EVO', creditRecords),
        pp:
          getGPCashAmount('PP', debitRecords) -
          getGPCashAmount('PP', creditRecords),
        bti:
          getGPCashAmount('BTI', debitRecords) -
          getGPCashAmount('BTI', creditRecords),
        igx:
          getGPCashAmount('IGX', debitRecords) -
          getGPCashAmount('IGX', creditRecords),
      },
      {
        label: 'turnover bonus',
        total: getGPTurnoverBonusAmount('ALL', turnoverBonusTxns),
        evo: getGPTurnoverBonusAmount('EVO', turnoverBonusTxns),
        pp: getGPTurnoverBonusAmount('PP', turnoverBonusTxns),
        bti: getGPTurnoverBonusAmount('BTI', turnoverBonusTxns),
        igx: getGPTurnoverBonusAmount('IGX', turnoverBonusTxns),
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
      }
    )

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
      }
    )

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
      }
    )

    const table3 = [
      {
        label: 'deposit',
        pending: dpPendingTxns.length,
        confirmed: dpSuccessTxns.length,
      },
      {
        label: 'withdraw',
        pending: wpPendingTxns.length,
        confirmed: wdSuccessTxns.length,
      },
      {
        label: 'register',
        pending: registeredUsers.filter((u) => !u.confirmed).length,
        confirmed: registeredUsers.filter((u) => !!u.confirmed).length,
      },
    ]

    // TABLE 4

    const allRegisteredUsers = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      {
        fields: ['id'],
      }
    )

    const table4 = [
      {
        label: 'total_users',
        count: allRegisteredUsers.length,
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
  },
})
