'use strict'
const { countByDate } = require('../services/utils')
const dayjs = require('dayjs')
const currency = 'KRW'
const amount_type = 'CASH'

module.exports = ({ strapi }) => ({
  async recent(ctx) {
    const query = ctx.request.query
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
          amount_type: 'CASH',
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
            amount_type: 'CASH',
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

          const [entities, count] = await strapi.db
            .query('plugin::users-permissions.user')
            .findWithCount({
              select: ['id'],
              where: {
                role: {
                  type: roleType,
                },
                createdAt,
              },
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
      const amount_type = args?.amount_type || '*'

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

    const agentInfo_topAgent = await getMembersByRoleAndDate({
      roleType: 'top_agent',
      format: 'COUNT',
    })
    const agentInfo_agent = await getMembersByRoleAndDate({
      roleType: 'agent',
      format: 'COUNT',
    })

    const newMembers_totalMembers = await getMembersByRoleAndDate({
      roleType: 'agent',
      format: 'COUNT',
    })

    const newMembers_amountForDepositMembers = await getTxnByDate({
      type: 'DEPOSIT',
      format: (entities) => {
        const user_ids = entities.map((entity) => entity.user.id)
        const unique_user_ids = Array.from(new Set(user_ids))
        return unique_user_ids.length
      },
      countType: 'NEW_USER',
    })

    const turnoverInfo_total = await getTxnByDate({
      type: 'DEBIT',
      format: (entities) => {
        const totalAmount = entities.reduce((acc, cur) => {
          acc += cur.amount
          return acc
        }, 0)

        return totalAmount
      },
    })

    const turnoverInfo_totalMember = await getTxnByDate({
      type: 'DEBIT',
      format: (entities) => {
        const user_ids = entities.map((entity) => entity.user.id)

        const unique_user_ids = Array.from(new Set(user_ids))

        return unique_user_ids.length
      },
    })

    const bettingInfo_validBetAmount = await getTxnByDate({
      type: 'DEBIT',
      amount_type: 'CASH',
      format: (entities) => {
        const totalAmount = entities.reduce((acc, cur) => {
          acc += cur.amount
          return acc
        }, 0)

        return totalAmount
      },
    })

    const depositInfo_total = await getTxnByDate({
      type: 'DEPOSIT',
      amount_type: 'CASH',
      format: (entities) => {
        const totalAmount = entities.reduce((acc, cur) => {
          acc += cur.amount
          return acc
        }, 0)

        return totalAmount
      },
    })

    const depositInfo_totalMember = await getTxnByDate({
      type: 'DEPOSIT',
      format: (entities) => {
        const user_ids = entities.map((entity) => entity.user.id)
        const unique_user_ids = Array.from(new Set(user_ids))
        return unique_user_ids.length
      },
    })

    const depositInfo_totalQty = await getTxnByDate({
      type: 'DEPOSIT',
      format: 'COUNT',
    })

    const withdrawInfo_total = await getTxnByDate({
      type: 'WITHDRAW',
      amount_type: 'CASH',
      format: (entities) => {
        const totalAmount = entities.reduce((acc, cur) => {
          acc += cur.amount
          return acc
        }, 0)

        return totalAmount
      },
    })

    const withdrawInfo_totalMember = await getTxnByDate({
      type: 'WITHDRAW',
      format: (entities) => {
        const user_ids = entities.map((entity) => entity.user.id)
        const unique_user_ids = Array.from(new Set(user_ids))
        return unique_user_ids.length
      },
    })

    const withdrawInfo_totalQty = await getTxnByDate({
      type: 'DEPOSIT',
      format: 'COUNT',
    })

    const data = {
      agentInfo_topAgent,
      agentInfo_agent,
      newMembers_totalMembers,
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
