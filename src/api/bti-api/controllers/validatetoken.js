"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  validatetoken: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { auth_token } = ctx.request.query;

      ctx.body = {
        status: "200",
        message: "get auth_token success",
        data: {
          error_code: "ec",
          error_message: "em",
          cust_id: "cid",
          balance: 0,
          cust_login: "cust_login",
          city: "city",
          country: "country",
          currency_code: "currency_code"
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
