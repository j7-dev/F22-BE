module.exports = {
  async beforeUpdate(event) {
    const { params } = event
    let { populate } = params
    if (populate?.user) {
      populate.user = {
        select: ['id', 'username'],
      }
    } else {
      populate = {
        user: {
          select: ['id', 'username'],
        },
      }
    }
  },
  async afterUpdate(event) {
    const { params, result } = event
    const { data } = params

    const status = data?.status
    const type = data?.type
    if (type === 'WITHDRAW' && status === 'SUCCESS') {
      const user_id = result?.user?.id
      if (!user_id) {
        throw new Error('user_id not found')
      }

      // 提款已核准，扣除 balance
      const updateResult = await strapi
        .service('api::wallet-api.wallet-api')
        .addBalance({
          amount: data?.amount,
          currency: data?.currency,
          amount_type: data?.amount_type,
          user_id,
        })

      // 扣款成功  更新 balance_after_mutate
      if (updateResult?.id) {
        const updateTxnResult = await strapi.entityService.update(
          'api::transaction-record.transaction-record',
          result?.id,
          {
            data: {
              balance_after_mutate: updateResult?.amount,
            },
          }
        )
      }
    }
  },
}
