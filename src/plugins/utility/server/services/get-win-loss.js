'use strict'
const currency = 'KRW'
const amount_type = 'CASH'

module.exports = ({ strapi }) => ({
  async main({ start, end }) {
    // get transaction-records
    const winRecords = await strapi.entityService.findMany(
      'api::transaction-record.transaction-record',
      {
        // fields: ["ID", "RESERVE_ID", "TRX_ID","CUST_ID","AMOUNT"],
        filters: {
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
        },
      }
    )

    const lossRecords = await strapi.entityService.findMany(
      'api::transaction-record.transaction-record',
      {
        // fields: ["ID", "RESERVE_ID", "TRX_ID","CUST_ID","AMOUNT"],
        filters: {
          type: 'BET',
          status: 'SUCCESS',
          amount: {
            $lt: 0,
          },
          currency,
          amount_type,
          createdAt: {
            $gt: start,
            $lt: end,
          },
        },
      }
    )

    console.log('⭐  main  lossRecords', lossRecords)
    // console.log('⭐  main  txnRecords', txnRecords)

    return 'Welcome to Strapi 🚀'
  },
})
