"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  balance: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { auth_token } = ctx.request.query;

      //TODO: auto_token from DB
      if(auth_token == "0"){
        ctx.body = {
          error_code: "-3",
          error_message: "TokenNotValid"
        };
        return;
      }
      
      
      ctx.body = {
          error_code: "0",
          error_message: "No error",
          cust_id: "abc123",
          balance: 100,
          cust_login: "abc123",
          city: "ID",
          country: "ID",
          currency_code: "IDR"
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
