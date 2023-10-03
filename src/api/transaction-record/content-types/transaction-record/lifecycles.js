module.exports = {
  async beforeUpdate(event) {
    const { params } = event
    const { data, where } = params
    const theTxn = await strapi.entityService.findOne(
      'api::transaction-record.transaction-record',
      where?.id,
      {
        populate: {
          user: {
            fields: ['id'],
          },
          updated_by_user_id: {
            fields: ['id', 'display_name'],
          },
        },
      }
    )

    const status = data?.status
    const type = theTxn?.type

    if (type === 'WITHDRAW' && status === 'SUCCESS') {
      const user_id = theTxn?.user?.id
      if (!user_id) {
        throw new Error('user_id not found')
      }
      if (theTxn?.updated_by_user_id?.id) {
        throw new Error(
          `Can't Update, this record has been updated by user ${theTxn?.updated_by_user_id?.display_name}`
        )
      }

      // 提款已核准，扣除 balance
      const updateResult = await strapi
        .service('api::wallet-api.wallet-api')
        .addBalance({
          amount: theTxn?.amount,
          currency: theTxn?.currency,
          amount_type: theTxn?.amount_type,
          user_id,
        })

      // 扣款成功  更新 balance_after_mutate
      if (updateResult?.id) {
        data.status = 'SUCCESS'
        data.balance_after_mutate = updateResult?.amount
      } else {
        data.status = 'FAILED'
        data.balance_after_mutate = null
        data.title = '提款失敗'
        data.description = JSON.stringify(updateResult)

        throw new Error(`update balance failed ${JSON.stringify(updateResult)}`)
      }
    }
  },
}
