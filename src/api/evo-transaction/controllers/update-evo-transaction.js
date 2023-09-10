'use strict'

module.exports = {
  main: async (ctx, next) => {
    const body = ctx.request.body

    // 如果沒有帶參數就回 400
    const requiredFields = ['transaction_id', 'transaction_type', 'is_finish']

    for (const field of requiredFields) {
      if (body.data[field] === undefined) {
        return ctx.badRequest(`${field} is required`)
      }
    }

    const findTxns = await strapi.entityService.findMany(
      'api::evo-transaction.evo-transaction',
      {
        filters: { transaction_id: body?.data?.transaction_id },
        populate: ['currency'],
      }
    )

    if (findTxns.length === 0) {
      return ctx.badRequest('transaction not found')
    }
    const findTxn = findTxns[0]

    const currency = body?.data?.currency || null

    const findCurrencies = !!currency
      ? await strapi.entityService.findMany('api::currency.currency', {
          filters: { slug: currency },
        })
      : []

    if (!!currency && findCurrencies.length === 0) {
      return ctx.badRequest('currency not found')
    }

    const findCurrency = findCurrencies[0]

    try {
      const updateResult = await strapi.entityService.update(
        'api::evo-transaction.evo-transaction',
        findTxn?.id,
        {
          data: {
            ...body?.data,
            currency: !!currency ? findCurrency?.id : findTxn?.currency?.id,
          },
        }
      )

      ctx.body = {
        status: '200',
        message: 'update evo transactions success',
        data: {
          ...updateResult,
          amount: updateResult?.amount?.toString(),
        },
      }
    } catch (err) {
      ctx.body = err
    }
  },
}
