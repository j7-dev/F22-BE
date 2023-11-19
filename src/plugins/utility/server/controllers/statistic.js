'use strict'
const { countByDate } = require('../services/utils')
const { removeUndefinedKeys } = require('../services/utils')
const dayjs = require('dayjs')
const default_currency = 'KRW'
const default_amount_type = 'CASH'

module.exports = ({ strapi }) => ({
  async recent(ctx) {
    const query = ctx?.request?.query
    const currency = query?.currency || default_currency
    const amount_type = query?.amount_type || default_amount_type
    const UTC9toUTC0 = global.appData.UTC9toUTC0

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
          start: UTC9toUTC0(dateItem.startD),
          end: UTC9toUTC0(dateItem.endD),
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
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
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
                $gte: UTC9toUTC0(dateItem.startD),
                $lte: UTC9toUTC0(dateItem.endD),
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
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
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
            type: ['DEPOSIT'],
            currency,
            amount_type,
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
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
    const UTC9toUTC0 = global.appData.UTC9toUTC0

    const dateArr = [
      {
        // today
        label: 'today',
        start: UTC9toUTC0(dayjs().startOf('day')),
        end: UTC9toUTC0(dayjs().endOf('day')),
      },
      {
        // yesterday
        label: 'yesterday',
        start: UTC9toUTC0(dayjs().subtract(1, 'day').startOf('day')),
        end: UTC9toUTC0(dayjs().subtract(1, 'day').endOf('day')),
      },
      {
        // this week
        label: 'thisWeek',
        start: UTC9toUTC0(dayjs().startOf('week')),
        end: UTC9toUTC0(dayjs().endOf('week')),
      },
      {
        // last week
        label: 'lastWeek',
        start: UTC9toUTC0(dayjs().subtract(1, 'week').startOf('week')),
        end: UTC9toUTC0(dayjs().subtract(1, 'week').endOf('week')),
      },
      {
        // this month
        label: 'thisMonth',
        start: UTC9toUTC0(dayjs().startOf('month')),
        end: UTC9toUTC0(dayjs().endOf('month')),
      },
      {
        // last month
        label: 'lastMonth',
        start: UTC9toUTC0(dayjs().subtract(1, 'month').startOf('month')),
        end: UTC9toUTC0(dayjs().subtract(1, 'month').endOf('month')),
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
    const user = ctx?.state?.user
    const roleType = user?.role?.type
    const agent_id = roleType === 'agent' ? user?.id : undefined
    const UTC9toUTC0 = global.appData.UTC9toUTC0

    const dateArr =
      countByDate({
        startD: dayjs(query?.start),
        endD: dayjs(query?.end),
      }) || []

    const dataSource = await Promise.all(
      dateArr.map(async (dateItem) => {
        const deposit = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: ['DEPOSIT'],
            currency,
            amount_type,
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
            agent_id,
          })

        const withdraw = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: ['WITHDRAW'],
            currency,
            amount_type,
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
            agent_id,
          })

        const dpWd = deposit + withdraw

        // 抓取有效投注
        const validBet =
          (await strapi.service('plugin::utility.bettingAmount').get({
            type: ['DEBIT'],
            currency,
            amount_type,
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
            agent_id,
          })) * -1

        // payout = 中獎金額，CREDIT且 金額為正數，但CREDIT本身應該就不會負數
        const payout =
          (await strapi.service('plugin::utility.bettingAmount').get({
            type: ['CREDIT'],
            currency,
            amount_type,
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
            agent_id,
          })) * -1

        // 紅利+洗碼
        const coupon = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: ['COUPON', 'MANUAL', 'TURNOVER_BONUS_TO_CASH'],
            currency,
            amount_type,
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
            agent_id,
          })
        // 加上目前的洗碼總和
        const turnoverBonusBalanceAmount = await strapi
          .service('plugin::utility.bettingAmount')
          .get({
            type: ['COUPON', 'MANUAL', 'TURNOVER_BONUS_TO_CASH'],
            currency,
            amount_type: 'TURNOVER_BONUS',
            start: UTC9toUTC0(dateItem.startD),
            end: UTC9toUTC0(dateItem.endD),
            agent_id,
          })

        //新註冊人數
        const getRegisterUsersResult = await strapi.entityService.findMany(
          'plugin::users-permissions.user',
          {
            fields: ['id'],
            filters: {
              createdAt: {
                $gte: UTC9toUTC0(dateItem.startD),
                $lte: UTC9toUTC0(dateItem.endD),
              },
            },
            populate: {
              agent: {
                fields: ['id'],
              },
            },
          }
        )
        const filteredGetRegisterUsersResult = getRegisterUsersResult.filter(
          (u) => {
            if (agent_id) {
              return u?.agent?.id === agent_id
            }
            return true
          }
        )

        const numberOfRegistrantUserIds = filteredGetRegisterUsersResult.map(
          (item) => item?.id
        )
        const uniqueNumberOfRegistrantUserIds = Array.from(
          new Set(numberOfRegistrantUserIds)
        )
        const numberOfRegistrants = uniqueNumberOfRegistrantUserIds.length

        const betRecords = await strapi.entityService.findMany(
          'api::bet-record.bet-record',
          {
            fields: ['id'],
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
            filters: {
              bet_time: {
                $gte: UTC9toUTC0(dateItem.startD),
                $lte: UTC9toUTC0(dateItem.endD),
              },
            },
          }
        )
        const filteredBetRecords = betRecords.filter((r) => {
          if (agent_id) {
            return r?.user?.agent?.id === agent_id
          }
          return true
        })
        const betRecordsUserIds = filteredBetRecords.map((txn) => txn?.user?.id)
        const uniqueDebitTxnUserIds = Array.from(new Set(betRecordsUserIds))
        const bettingMembers = uniqueDebitTxnUserIds.length

        const payload = {
          date: dateItem.startD.format('YYYY/MM/DD (dd)'),
          deposit,
          withdraw,
          dpWd,
          validBet,
          payout, // 顯示為負數
          winloss: validBet + payout,
          coupon: coupon + turnoverBonusBalanceAmount,
          profit: validBet + payout - coupon,
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
    const filteredTurnoverBonusBalances = allTurnoverBonusBalances.filter(
      (b) => {
        if (agent_id) {
          return b?.user?.agent?.id === agent_id
        }
        return true
      }
    )
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
        (getGPCashAmount(
          game_provider,
          filteredBettingRecords,
          'credit_amount'
        ) +
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
  },
})
