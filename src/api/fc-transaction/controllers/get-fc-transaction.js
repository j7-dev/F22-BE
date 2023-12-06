'use strict'
const { removeUndefinedKeys } = require('utils')

module.exports = {
  main: async (ctx, next) => {
    const query = ctx.request.query

    // 如果沒有帶參數就回 400
    const requiredFields = ['user_id']

    for (const field of requiredFields) {
      if (query?.[field] === undefined) {
        return ctx.badRequest(`${field} is required`)
      }
    }

    const user_id = query?.user_id
    const record_id = query?.record_id
    const filters = removeUndefinedKeys({ user_id, record_id })

    const transactions = await strapi.entityService.findMany(
      'api::fc-transaction.fc-transaction',
      {
        filters,
        populate: ['user_id'],
        sort: { createdAt: 'desc' },
      }
    )

    const formattedTransactions = transactions.map((transaction) => ({
      user_id,
      currency: transaction?.currency,
      amount: transaction?.amount,
      record_id: transaction?.record_id,
      bank_id: transaction?.bank_id,
      transaction_type: transaction?.transaction_type,
    }))

    ctx.body = {
      status: '200',
      message: 'get fc transactions success',
      data: formattedTransactions,
    }
  },
}
