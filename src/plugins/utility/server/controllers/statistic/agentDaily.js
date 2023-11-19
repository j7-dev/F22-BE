'use strict'
const { countByDate } = require('../../services/utils')
const dayjs = require('dayjs')
const default_currency = 'KRW'
const default_amount_type = 'CASH'

module.exports = async (ctx) => {
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
      const coupon = await strapi.service('plugin::utility.bettingAmount').get({
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
}
