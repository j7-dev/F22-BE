'use strict'

module.exports = {
  main: async (ctx, next) => {
    const query = ctx.request.query

    // 如果沒有帶參數就回 400
    const requiredFields = ['login_id', 'bet_id']

    for (const field of requiredFields) {
      if (query?.[field] === undefined) {
        return ctx.badRequest(`${field} is required`)
      }
    }
    const transactions = await strapi.entityService.findMany(
      'api::golf-transaction.golf-transaction',
      {
        filters: {
          login_id: query.login_id,
          bet_id: query.bet_id,
        },
        populate: ['user_id'],
        sort: { createdAt: 'desc' },
      }
    )

    const formattedTransactions = transactions.map((transaction) => ({
      user_id: transaction?.user_id?.id,
      login_id: transaction?.login_id,
      bet_id: transaction?.bet_id,
      currency: transaction?.currency,
      amount: transaction?.amount?.toString(),
      transaction_type: transaction?.transaction_type,
    }))

    ctx.body = {
      status: '200',
      message: 'get golf transactions success',
      data: formattedTransactions,
    }
  },
}
