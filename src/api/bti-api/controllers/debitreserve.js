"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  debitreserve: async (ctx, next) => {
    ctx.type = 'text/plain';
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, amount, req_id, agent_id, customer_id, purchase_id, extsessionID } = ctx.request.query;
      const trx_id = reserve_id + "_" + cust_id + "_" + req_id;
      console.log(ctx.request.query);
      // 取得 reserve_id 的所有 record
      const reserve = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id"],
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

      var accepted_reserve_amount = 0;
      var accepted_debitreserve_amount = 0;
      var available_amount = 0;

      for (const item of reserve) {
        console.log(item);
        console.log(item.type);
        console.log("---");
        console.log(item.req_id);
        console.log(req_id);
        if (item.req_id === req_id) {
          ctx.body = {
            error_code: "0",
            error_message: "No Error",
            trx_id: item.trx_id,
            balance: 0
          };
          return;
        }

        if (item.type === "reserve") {
          accepted_reserve_amount += item.amount;
        }

        if (item.type === "debitreserve") {
          accepted_debitreserve_amount += item.amount;
        }
      }
      console.log(accepted_reserve_amount);
      console.log(accepted_debitreserve_amount);
      available_amount = accepted_reserve_amount - accepted_debitreserve_amount;
      console.log(available_amount);
      if(amount > available_amount){
        ctx.body = {
          error_code: "0",
          error_message: "Total DebitReserve amount larger than Reserve amount",
          trx_id: trx_id,
          balance: 0
        };
        return;
      }

      const result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: reserve_id + "_" + cust_id + "_" + req_id,
            cust_id: cust_id,
            amount: amount,
            reserve_id: reserve_id,
            req_id: req_id,
            purchase_id: purchase_id,
            url: ctx.request.url,
            type: "debitreserve",
          },
        }
      )

      ctx.body = {
        error_code: "0",
        error_message: "No Error",
        trx_id: reserve_id,
        balance: amount
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
