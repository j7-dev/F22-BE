"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  creditcustomer: async (ctx, next) => {
    ctx.type = 'text/plain';
    try {
      // 取的 query string 的 auth_token
      const { cust_id, amount, req_id, agent_id, customer_id, purchase_id } = ctx.request.query;

      const result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            cust_id: cust_id,
            amount: amount,
            agent_id: agent_id,
            customer_id: customer_id,
            req_id: req_id,
            purchase_id: purchase_id,
            url: "test",
            type: "creditcustomer",
          },
        }
      )

      ctx.body = {
        status: "200",
        message: "post creditcustomer success",
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
