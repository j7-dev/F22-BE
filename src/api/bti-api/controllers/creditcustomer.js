"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  creditcustomer: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id, amount, req_id, agent_id, customer_id, purchase_id } = ctx.request.query;

      // 取得 req_id 的所有 record
      const reserve = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id", "after_balance"],
          filters: { req_id },
        }
      );

      console.log(reserve);
      if (reserve.length > 0) {
        //TODO:get balance by user id

        ctx.body = {
          error_code: "0",
          error_message: "ReserveID Not Exist",
          balance: 0,
          trx_id: reserve[0].trx_id
        };
        return;
      }

      const create_bti_request_result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: req_id + "_" + cust_id + "_" + purchase_id,
            cust_id: cust_id,
            amount: amount,
            req_id: req_id,
            purchase_id: purchase_id,
            url: ctx.request.url,
            type: "creditcustomer",
          },
        }
      )

      ctx.body = {
        error_code: "0",
        error_message: "No Error",
        balance: 0
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
