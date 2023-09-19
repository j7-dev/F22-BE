'use strict'

module.exports = {
  main: async (ctx, next) => {
    const query = ctx.request.query

    // 如果沒有帶參數就回 400
    const requiredFields = ['user_id', 'reference']

    for (const field of requiredFields) {
      if (query?.[field] === undefined) {
        return ctx.badRequest(`${field} is required`)
      }
    }

    const filters = {
      user_id: query.user_id,
      reference: query.reference,
      transaction_id: query.transaction_id,
    }
    for (let key in filters) {
      if (filters.hasOwnProperty(key) && filters[key] === undefined) {
        delete filters[key]
      }
    }

    try {
      const transactions = await strapi.entityService.findMany(
        'api::pp-transaction.pp-transaction',
        {
          filters,
          populate: ['user_id'],
          sort: { createdAt: 'desc' },
        }
      )

      const formattedTransactions = transactions.map((transaction) => ({
        ...transaction,
        amount: transaction?.amount?.toString(),
        timestamp: Number(transaction?.timestamp),
        user_id: transaction?.user_id?.id,
        transaction_id: transaction?.id,
      }))

      ctx.body = {
        status: '200',
        message: 'get pp transactions success',
        data: formattedTransactions,
      }
    } catch (err) {
      ctx.body = err
    }
  },
}
