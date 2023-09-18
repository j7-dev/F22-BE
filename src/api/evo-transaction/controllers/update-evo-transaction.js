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
      }
    )

    if (findTxns.length === 0) {
      return ctx.badRequest('transaction not found')
    }
    const findTxn = findTxns[0]
    const siteSetting = await strapi.entityService.findMany(
      'api::site-setting.site-setting'
    )
    const defaultCurrency = siteSetting?.default_currency

    const currency =
      body?.data?.currency.toUpperCase() || defaultCurrency || null

    try {
      const updateResult = await strapi.entityService.update(
        'api::evo-transaction.evo-transaction',
        findTxn?.id,
        {
          data: {
            ...body?.data,
            currency,
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
