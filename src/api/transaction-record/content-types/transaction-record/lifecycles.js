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
            populate: {
              vip: {
                fields: ['id', 'label'],
              },
            },
          },
          updated_by_user_id: {
            fields: ['id', 'display_name'],
          },
          deposit_bonus: {
            fields: '*',
          },
        },
      }
    )

    const status = data?.status
    const amount = data?.amount

    const type = theTxn?.type
    const allow_types = ['DEPOSIT', 'WITHDRAW']

    // 存提款成功 發站內通知
    if (allow_types.includes(type) && status === 'SUCCESS') {
      const user_id = theTxn?.user?.id
      if (!user_id) {
        throw new Error('user_id not found')
      }
      if (theTxn?.updated_by_user_id?.id) {
        throw new Error(
          `Can't Update, this record has been updated by user ${theTxn?.updated_by_user_id?.display_name}`
        )
      }

      // 存款已核准，更新 balance，提款核准不變
      // 存款，將deposit_bonus加上USER
      if (type === 'DEPOSIT') {
        const updateResult = await strapi
          .service('api::wallet-api.wallet-api')
          .addBalance({
            amount: theTxn?.amount,
            currency: theTxn?.currency,
            amount_type: theTxn?.amount_type,
            user_id,
          })

        // 更新成功
        if (updateResult?.id) {
          data.status = 'SUCCESS'
          // 更新 balance_after_mutate
          data.balance_after_mutate = updateResult?.amount

          // 發送站內信
          const createNotification = await strapi.entityService.create(
            'api::cms-post.cms-post',
            {
              data: {
                title: `${type} Approved`,
                content: `The ${type} ( ${Math.abs(theTxn.amount)} ${
                  theTxn?.currency
                } ) you submitted on ${
                  theTxn?.createdAt
                } has been approved \n\n transaction_id: ${theTxn?.id}`,
                post_type: 'siteNotify',
                send_to_user_ids: [user_id],
                publishedAt: new Date(),
              },
            }
          )
        } else {
          data.status = 'FAILED'
          data.balance_after_mutate = null
          data.title = `${type} failed`
          data.description = JSON.stringify(updateResult)

          throw new Error(
            `update balance failed ${JSON.stringify(updateResult)}`
          )
        }

        const updateUserResult = await strapi.entityService.update(
          'plugin::users-permissions.user',
          user_id,
          {
            data: {
              last_deposit: theTxn?.id,
            },
          }
        )
      }
    }

    // TODO 存款紅利判斷 案類型 不同規則
    // 存款紅利發放

    const deposit_bonus = theTxn?.deposit_bonus
    const min_deposit_amount = deposit_bonus?.min_deposit_amount || 0

    if (
      !!deposit_bonus &&
      type === 'DEPOSIT' &&
      status === 'SUCCESS' &&
      amount >= min_deposit_amount
    ) {
      const bonus_rate = deposit_bonus?.bonus_rate / 100
      const calculate_bonus = bonus_rate * amount
      const max_bonus_amount = deposit_bonus?.max_bonus_amount || 0
      const bonus = !!max_bonus_amount
        ? calculate_bonus > max_bonus_amount
          ? max_bonus_amount
          : calculate_bonus
        : calculate_bonus

      // 將 bonus 寫入 balance
      const result = await strapi.service('api::wallet-api.wallet-api').add({
        user_id: theTxn?.user?.id,
        amount: bonus,
        title: `deposit_bonus ${deposit_bonus.label} #${deposit_bonus.id}`,
        type: 'COUPON',
        by: 'SYSTEM',
        currency: deposit_bonus.currency,
        amount_type: deposit_bonus.amount_type,
      })
    }
  },
  async afterUpdate(event) {
    const { result } = event
    const txn_id = result?.id
    const status = result?.status
    const amount = result?.amount
    const type = result?.type
    if (type === 'WITHDRAW' && status === 'CANCEL') {
      const handleCancelWithdrawResult = await strapi
        .service('api::transaction-record.transaction-record')
        .handleCancelWithdraw(event)
    }
    if (type === 'WITHDRAW' && status === 'SUCCESS') {
      const handleRemoveDepositBonusResult = await strapi
        .service('api::transaction-record.transaction-record')
        .handleRemoveDepositBonus(event)
    }
  },
  async beforeCreate(event) {
    const { params = {} } = event
    const { data = {} } = params
    const status = data?.status
    const type = data?.type
    if (type === 'WITHDRAW' && status === 'PENDING') {
      const handleWithdrawResult = await strapi
        .service('api::transaction-record.transaction-record')
        .handleWithdraw(event)
    }
  },
  async afterCreate(event) {
    const { result } = event
    const txn_id = result?.id
    const status = result?.status
    const amount = result?.amount
    const type = result?.type

    // 排除 BTI
    if (type === 'DEBIT' && status === 'SUCCESS') {
      const handleTurnoverBonusResult = await strapi
        .service('api::transaction-record.transaction-record')
        .handleTurnoverBonus(event)
    }

    // 解除存款紅利限制判定 錢輸光 或 提款領光 才解除用戶限制
    if (type === 'CREDIT' && status === 'SUCCESS') {
      const handleRemoveDepositBonusResult = await strapi
        .service('api::transaction-record.transaction-record')
        .handleRemoveDepositBonus(event)
    }
  },
}
