'use strict'

module.exports = {
  main: async (ctx) => {
    try {
      // Read from POST body
      const { type, by, title, description, amount, user_id, bet_record_id } =
        ctx.request.body

      await strapi.db.transaction(
        async ({ trx, rollback, commit, onCommit, onRollback }) => {
          // Find the user
          const user = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user_id,
            {
              fields: ['cash_balance'],
              populate: ['transaction_records'],
            }
          )
          console.log('⭐  user', user)

          // Check if the user exists
          if (!user) {
            return ctx.badRequest(null, 'User not found')
          }
          // 預防用戶金額不夠扣
          if (Number(user.cash_balance) + Number(amount) < 0) {
            return ctx.badRequest(null, 'Insufficient balance')
          }

          /**
           * @ref https://docs.strapi.io/dev-docs/api/entity-service/crud#create
           * 創建一筆 Transaction Record
           */

          const theTransaction = await strapi.entityService.create(
            'api::transaction-record.transaction-record',
            {
              data: {
                title,
                description,
                amount,
                by,
                user: user_id, // connect
                bet_record: bet_record_id, // connect
              },
            }
          )

          // Update the user balance
          const user_transaction_records = user?.transaction_records || []
          const user_transaction_record_ids = user_transaction_records.map(
            (item) => item.id
          )

          const updateResult = await strapi.entityService.update(
            'plugin::users-permissions.user',
            user_id,
            {
              data: {
                // TODO 之後要考慮到 transaction_record 的 Status 才做紀錄
                cash_balance: user.cash_balance + amount,
                transaction_record_ids: [
                  ...user_transaction_record_ids,
                  theTransaction.id,
                ],
              },
            }
          )

          // respond
          ctx.body = {
            status: '200',
            message: 'updateBalance success',
            data: updateResult,
          }
        }
      )
    } catch (err) {
      ctx.body = err
    }
  },
}
