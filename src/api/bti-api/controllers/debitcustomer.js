"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  debitcustomer: async (ctx, next) => {
    ctx.type = 'text/plain';
    try {
      // 取的 query string 的 auth_token
      const { cust_id, amount, req_id, agent_id, customer_id, purchase_id } = ctx.request.query;

      const result = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id"],
          filters: { req_id },
        }
      );
      console.log(result);
      if (result.length > 0) {
        ctx.body = {
          error_code: "0",
          error_message: "No Error",
          balance: 0,
          trx_id: result.trx_id
        };
        return;
      }

      const debitcustomer_result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: cust_id + "_" + req_id,
            cust_id: cust_id,
            amount: amount,
            req_id: req_id,
            purchase_id: purchase_id,
            url: ctx.request.url,
            type: "debitcustomer",
          },
        }
      )

      ctx.body = {
        error_code: "0",
        error_message: "No Error",
        balance: 0,
        trx_id: debitcustomer_result.trx_id
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
