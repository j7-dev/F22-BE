"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  commitreserve: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, agent_id, customer_id, purchase_id } = ctx.request.query;

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
        //TODO:get balance by user id
        
        ctx.body = {
          error_code: "0",
          error_message: "ReserveID Not Exist",
          balance: 0
        };
        return;
      }

      var accepted_reserve_amount = 0;
      var accepted_debitreserve_amount = 0;
      var available_amount = 0;

      for (const item of reserve) {
        if (item.type === "reserve") {
          accepted_reserve_amount += item.amount;
        }

        if (item.type === "debitreserve") {
          accepted_debitreserve_amount += item.amount;
        }

        if (item.type === "commitreserve") {
          ctx.body = {
            error_code: "0",
            error_message: "No Error",
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
            type: "commitreserve",
          },
        }
      )

      available_amount = accepted_reserve_amount - accepted_debitreserve_amount;
      //TODO: add available_amount back to player wallet
      ctx.body = {
        error_code: "0",
        error_message: "No Error",
        balance: available_amount
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
