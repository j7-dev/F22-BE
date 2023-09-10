"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  debitreserve: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id } = ctx.request.query;
      const { reserve_id } = ctx.request.query;
      const { amount } = ctx.request.query;
      const { req_id } = ctx.request.query;

      ctx.body = {
        status: "200",
        message: "post debitreserve success",
        data: {
          error_code: "error_code",
          error_message: "error_message",
          trx_id: reserve_id,
          balance: amount
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
