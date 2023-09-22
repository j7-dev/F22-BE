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
      
      const query = ctx.request.query
      try {
        const result = await strapi
          .service('api::wallet-api.wallet-api')
          .get(query)
        ctx.body = {
          status: "success",
          balance: 100,
          data: result,
        }
      } catch (err) {
        ctx.body = err
      }
      
    } catch (err) {
      ctx.body = err;
    }
  },
};
