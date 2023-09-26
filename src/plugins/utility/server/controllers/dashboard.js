'use strict'
const { countByDate } = require('../services/utils')
const dayjs = require('dayjs')

module.exports = ({ strapi }) => ({
  async home(ctx) {
    const query = ctx.request.query
    const dateArr =
      countByDate({
        startD: dayjs(query?.start),
        endD: dayjs(query?.end),
      }) || []

    const winLossRatio = await Promise.all(
      dateArr.map(async (dateItem) => {
        const value = await strapi
          .service('plugin::utility.bettingAmount')
          .getWinLossRatio({
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
    console.log('⭐  winLossRatio  winLossRatio', winLossRatio)

    const data = {
      winLossRatio,
    }

    ctx.body = {
      status: '200',
      message: 'get dashboard/home success',
      data,
    }
  },
})
