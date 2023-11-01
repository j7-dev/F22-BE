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
          deposit_bonus: {
            fields: ['id'],
          },
        },
      }
    )

    const status = data?.status
    const type = theTxn?.type
    const allow_types = ['DEPOSIT', 'WITHDRAW']

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

      //

      // 提款 | 存款已核准，更新 balance
      const updateResult = await strapi
        .service('api::wallet-api.wallet-api')
        .addBalance({
          amount: theTxn?.amount,
          currency: theTxn?.currency,
          amount_type: theTxn?.amount_type,
          user_id,
        })

      // 如果是存款，將deposit_bonus加上USER
      if (type === 'DEPOSIT') {
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
            },
          }
        )
      } else {
        data.status = 'FAILED'
        data.balance_after_mutate = null
        data.title = `${type} failed`
        data.description = JSON.stringify(updateResult)

        throw new Error(`update balance failed ${JSON.stringify(updateResult)}`)
      }
    }
  },

  async afterCreate(event) {
    const { result } = event
    /**
	id: 102,
  type: 'DEPOSIT',
  by: 'USER',
  title: 'smtbet7 deposit 1 KRW',
  description: null,
  amount: 1,
  status: 'SUCCESS',
  createdAt: '2023-10-11T10:13:40.642Z',
  updatedAt: '2023-10-11T10:13:40.642Z',
  currency: 'KRW',
  amount_type: 'CASH',
  balance_after_mutate: 48272
		 */
    const txn_id = result?.id
    const status = result?.status
    const deposit_amount = result?.amount
    const type = result?.type

    const theTxn = await strapi.entityService.findOne(
      'api::transaction-record.transaction-record',
      txn_id,
      {
        populate: {
          user: {
            fields: ['id'],
            populate: {
              vip: {
                fields: ['id', 'label'],
                populate: ['deposit_bonus', 'discount'],
              },
            },
          },
        },
      }
    )
    // TODO 返水
    // const discount = theTxn?.user?.vip?.discount
    // console.log('⭐  discount:', discount)
    // const discount_ratio = discount?.ratio
    // console.log('⭐  discount_ratio:', discount_ratio)

    const deposit_bonus = theTxn?.user?.vip?.deposit_bonus
    console.log('⭐  deposit_bonus:', deposit_bonus)
    const deposit_bonus_extra_ratio = deposit_bonus?.extra_ratio
    console.log('⭐  deposit_bonus_extra_ratio:', deposit_bonus_extra_ratio)
    const min_deposit_amount = deposit_bonus?.min_deposit_amount || 0

    // TODO 存款紅利判斷 案類型 不同規則
    const deposit_type = deposit_bonus?.deposit_type
    if (
      !!deposit_bonus &&
      type === 'DEPOSIT' &&
      status === 'SUCCESS' &&
      deposit_amount >= min_deposit_amount
    ) {
      const bonus_rate = deposit_bonus?.bonus_rate / 100
      const calculate_bonus = bonus_rate * deposit_amount
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
}
