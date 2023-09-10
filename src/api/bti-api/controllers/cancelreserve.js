"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  cancelreserve: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id } = ctx.request.query;
      const { reserve_id } = ctx.request.query;

      ctx.body = {
        status: "200",
        message: "post cancelreserve success",
        data: {
          error_code: "error_code",
          error_message: "error_message",
          balance: 0
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
