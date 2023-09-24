"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  cancelreserve: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, agent_id, customer_id } = ctx.request.query;

      // 取得 reserve_id 的所有 record
      const reserve = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id", "after_balance"],
          filters: { reserve_id },
        }
      );
      console.log(reserve);
      if (reserve.length == 0) {
        ctx.body = {
          error_code: "0",
          error_message: "ReserveID Not Exist",
          trx_id: 0,
          balance: 0
        };
        return;
      }

      if (reserve.length == 1 && reserve[0].reserve_id === "reserve_id") {
        //TODO:add balance back to player and get latest balance for response
        //TODO: update reserve status to cancelled
        ctx.body = {
          error_code: "0",
          error_message: "No Error",
          balance: 0
        };
        return;
      }

      for (const item of reserve) {
        if (item.type === "cancelreserve") {
          ctx.body = {
            error_code: "0",
            error_message: "No Error",
            trx_id: item.trx_id,
            balance: item.after_balance
          };
          return;
        }

        if (item.type === "debitreserve") {
          ctx.body = {
            error_code: "0",
            error_message: "Already Debitted Reserve",
            balance: item.after_balance
          };
          return;
        }
      }

      const result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: reserve_id + "_" + cust_id,
            cust_id: cust_id,
            reserve_id: reserve_id,
            url: ctx.request.url,
            type: "cancelreserve",
          },
        }
      )

    } catch (err) {
      ctx.body = err;
    }
  },
};
