"use strict";

/**
 * A set of functions called "actions" for `wallet-api`
 */


module.exports = {
  balance: async (ctx, next) => {
    try {
      // 取的 query string 的 userId
      const { userId } = ctx.request.query;

      // 取得 userId 的所有 transaction-record
      const entries = await strapi.entityService.findMany(
        "api::transaction-record.transaction-record",
        {
          fields: ["title", "amount"],
          filters: { userId },
        }
      );

      // 計算 cash_balance ，就是遍歷 entries 的 amount 加總起來
      // 白話就是  把這 user 的每筆 record 的 amount 加總起來
      const cash_balance = entries.reduce((acc, cur) => {
        return acc + cur.amount;
      }, 0);

      ctx.body = {
        status: "200",
        message: "get cash_balance success",
        data: {
          cash_balance,
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
