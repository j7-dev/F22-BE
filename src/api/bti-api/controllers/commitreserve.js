"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  commitreserve: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, agent_id, customer_id, purchase_id } = ctx.request.query;

      const result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            cust_id: cust_id,
            reserve_id: reserve_id,
            agent_id: agent_id,
            customer_id: customer_id,
            purchase_id: purchase_id,
            url: "test",
            type: "commitreserve",
          },
        }
      )

      ctx.body = {
          error_code: "0",
          error_message: "No Error",
          balance: 0,
          trx_id: reserve_id
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
