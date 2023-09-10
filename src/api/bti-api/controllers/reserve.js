"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  reserve: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id } = ctx.request.query;
      const { reserve_id } = ctx.request.query;
      const { amount } = ctx.request.query;
      const { extsessionID } = ctx.request.query;

      ctx.body = {
        status: "200",
        message: "post reserve success",
        data: {
          error_code: "error_code",
          error_message: "error_message",
          balance: amount,
          trx_id: reserve_id
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
