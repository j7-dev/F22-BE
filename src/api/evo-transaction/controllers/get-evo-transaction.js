'use strict'

module.exports = {
  main: async (ctx, next) => {
    const query = ctx.request.query

    // 如果沒有帶參數就回 400
    const requiredFields = ['transaction_id', 'transaction_ref_id']

    const hasParam = requiredFields.some((field) => query[field] === undefined)

    if (!hasParam) {
      return ctx.badRequest(`transaction_id / transaction_ref_id is required`)
    }

    const filters = {
      transaction_id: query.transaction_id,
      transaction_ref_id: query.transaction_ref_id,
    }
    for (let key in filters) {
      if (filters.hasOwnProperty(key) && filters[key] === undefined) {
        delete filters[key]
      }
    }

    try {
      const transactions = await strapi.entityService.findMany(
        'api::evo-transaction.evo-transaction',
        {
          filters,
          populate: ['user_id', 'currency'],
          sort: { createdAt: 'desc' },
        }
      )

      const formattedTransactions = transactions.map((transaction) => ({
        ...transaction,
        user_id: transaction.user_id.id,
        currency: transaction.currency.slug,
      }))

      ctx.body = {
        status: '200',
        message: 'get evo transactions success',
        data: formattedTransactions,
      }
    } catch (err) {
      ctx.body = err
    }
  },
}
