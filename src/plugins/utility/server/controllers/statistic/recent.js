'use strict'
const { countByDate } = require('../../services/utils')
const dayjs = require('dayjs')
const default_currency = 'KRW'
const default_amount_type = 'CASH'

module.exports = async (ctx) => {
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
      const value = await strapi.service('plugin::utility.bettingAmount').get({
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
      const value = await strapi.service('plugin::utility.bettingAmount').get({
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
}
