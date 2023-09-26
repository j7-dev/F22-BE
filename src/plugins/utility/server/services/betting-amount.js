'use strict'

const currency = 'KRW'
const amount_type = 'CASH'

module.exports = ({ strapi }) => ({
  async get() {
    return 'Welcome to Strapi 🚀'
  },
  async getWin(args) {
    const start = args?.start
    const end = args?.end
    const user_id = args?.user_id

    const filters = {
      type: 'BET',
      status: 'SUCCESS',
      amount: {
        $gt: 0,
      },
      currency,
      amount_type,
      createdAt: {
        $gt: start,
        $lt: end,
      },
    }

    const winRecords = await strapi.entityService.findMany(
      'api::transaction-record.transaction-record',
      {
        // fields: ["ID", "RESERVE_ID", "TRX_ID","CUST_ID","AMOUNT"],
        filters,
      }
    )

    const totalWin = winRecords.reduce((acc, cur) => {
      return Number(acc) + Number(cur.amount)
    }, 0)

    return totalWin
  },
  async getLoss() {
    return 'Welcome to Strapi 🚀'
  },
})
