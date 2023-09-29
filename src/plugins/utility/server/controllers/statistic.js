'use strict'
const { countByDate } = require('../services/utils')
const { removeUndefinedKeys } = require('../services/utils')
const dayjs = require('dayjs')
const deafault_currency = 'KRW'
const deafault_amount_type = 'CASH'

module.exports = ({ strapi }) => ({
  async recent(ctx) {
    const query = ctx.request.query
    const currency = query?.currency || deafault_currency
    const amount_type = query?.amount_type || deafault_amount_type
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
    //         start: dateItem.startD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    //         end: dateItem.endD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
          start: dateItem.startD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
          end: dateItem.endD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
            start: dateItem.startD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            end: dateItem.endD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
    //         start: dateItem.startD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    //         end: dateItem.endD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
                $gte: dateItem.startD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                $lte: dateItem.endD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
            start: dateItem.startD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            end: dateItem.endD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
            start: dateItem.startD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            end: dateItem.endD.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
    const currency = query?.currency || deafault_currency
    const amount_type = query?.amount_type || deafault_amount_type
    const dateArr = [
      {
        // today
        label: 'today',
        start: dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        end: dayjs().endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      },
      {
        // yesterday
        label: 'yesterday',
        start: dayjs()
          .subtract(1, 'day')
          .startOf('day')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        end: dayjs()
          .subtract(1, 'day')
          .endOf('day')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      },
      {
        // this week
        label: 'thisWeek',
        start: dayjs().startOf('week').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        end: dayjs().endOf('week').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      },
      {
        // last week
        label: 'lastWeek',
        start: dayjs()
          .subtract(1, 'week')
          .startOf('week')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        end: dayjs()
          .subtract(1, 'week')
          .endOf('week')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      },
      {
        // this month
        label: 'thisMonth',
        start: dayjs().startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        end: dayjs().endOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      },
      {
        // last month
        label: 'lastMonth',
        start: dayjs()
          .subtract(1, 'month')
          .startOf('month')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        end: dayjs()
          .subtract(1, 'month')
          .endOf('month')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
})
