"use strict";

/**
 * A set of functions called "actions" for `wallet-api`
 */

module.exports = {
  deduct: async (ctx, next) => {
    try {
      const { title, description, amount, by, userId } = ctx.request.body;
      /**
       * @ref https://docs.strapi.io/dev-docs/api/entity-service/crud#create
       * 創建一筆 transaction-record
       */
      const entry = await strapi.entityService.create(
        "api::transaction-record.transaction-record",
        {
          data: {
            title,
            description,
            amount,
            by,
            userId,
          },
        }
      );

      /**
       * @ref https://forum.strapi.io/t/how-to-use-entityservice-for-user/23087
       * 取得 userId 的初始 cash_balance
       * 這個 userData 只是一個範例，沒有用到
       * ⚠️ 做一般 user 的 CRUD 要用 "plugin::users-permissions.user"
       */

      const userData = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          fields: ["cash_balance"],
          populate: ["role"], // populate 會把關聯的資料取出來，例如 user 關聯 role 你可以把 role 的詳細資料易起帶出來
        }
      );

      const userCashBalance = userData.cash_balance;

      // 更新 user 的 cash_balance 欄位
      const updateResult = await strapi.entityService.update(
        "plugin::users-permissions.user",
        userId,
        {
          data: {
            cash_balance: userCashBalance + amount,
          },
        }
      );
      ctx.body = {
        status: "200",
        message: "deducted success",
        data: {
          entry,
          updateResult,
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
