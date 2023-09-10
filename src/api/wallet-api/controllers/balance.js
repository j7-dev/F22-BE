'use strict'

module.exports = {
  add: async (ctx) => {
    try {
      // Read from POST body
      const { type, by, title, description, amount, user_id, bet_record_id } =
        ctx.request.body

      // 如果沒有帶參數就回 400
      const requiredFields = ['type', 'by', 'title', 'amount', 'user_id']

      for (const field of requiredFields) {
        if (!ctx.request.body[field]) {
          return ctx.badRequest(`${field} is required`)
        }
      }

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
  get: async (ctx, next) => {
    try {
      // 取的 query string 的 userId
      const { user_id } = ctx.request.query

      // 如果沒有帶參數就回 400
      const requiredFields = ['user_id']

      for (const field of requiredFields) {
        if (!ctx.request.query[field]) {
          return ctx.badRequest(`${field} is required`)
        }
      }

      // 取得 userId 的所有 transaction-record
      const userData = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user_id,
        {
          fields: ['id', 'username', 'cash_balance'],
        }
      )

      ctx.body = {
        status: '200',
        message: 'get cash_balance success',
        data: userData,
      }
    } catch (err) {
      ctx.body = err
    }
  },
  calculate: async (ctx, next) => {
    try {
      // 取的 query string 的 userId
      const { user_id } = ctx.request.query

      // 如果沒有帶參數就回 400
      const requiredFields = ['user_id']

      for (const field of requiredFields) {
        if (!ctx.request.query[field]) {
          return ctx.badRequest(`${field} is required`)
        }
      }

      // 取得 userId 的所有 transaction-record
      const entries = await strapi.entityService.findMany(
        'api::transaction-record.transaction-record',
        {
          fields: ['title', 'amount'],
          filters: { user_id },
        }
      )

      // 計算 cash_balance ，就是遍歷 entries 的 amount 加總起來
      // 白話就是  把這 user 的每筆 record 的 amount 加總起來
      const cash_balance = entries.reduce((acc, cur) => {
        return acc + cur.amount
      }, 0)

      ctx.body = {
        status: '200',
        message: 'get cash_balance success',
        data: {
          cash_balance,
        },
      }
    } catch (err) {
      ctx.body = err
    }
  },
}
