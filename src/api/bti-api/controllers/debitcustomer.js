"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  debitcustomer: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id } = ctx.request.query;
      const { req_id } = ctx.request.query;
      const { amount } = ctx.request.query;
      const { purchase_id } = ctx.request.query;

      ctx.body = {
        status: "200",
        message: "post debitcustomer success",
        data: {
          error_code: "error_code",
          error_message: "error_message",
          balance: 0,
          trx_id: purchase_id
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
