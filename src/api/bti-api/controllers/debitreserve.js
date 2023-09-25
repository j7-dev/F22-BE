"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  debitreserve: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, amount, req_id, agent_id, customer_id, purchase_id, extsessionID } = ctx.request.query;

      // 取得 reserve_id 的所有 record
      const reserve = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["ID", "RESERVE_ID", "TRX_ID","CUST_ID","AMOUNT"],
          filters: { reserve_id },
        }
      );
      console.log(reserve);
      if(reserve.id == undefined){
          ctx.body = {
            error_code: "0",
            error_message: "ReserveID Not Exist",
            trx_id: 0,
            balance: 0
        };
        return;
      }

      const result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: reserve_id,
            cust_id: cust_id,
            amount: amount,
            reserve_id: reserve_id,
            req_id: reserve_id,
            purchase_id: null,
            url: "test",
            type: "debitreserve",
          },
        }
      )

      ctx.body = {
          error_code: "error_code",
          error_message: "error_message",
          trx_id: reserve_id,
          balance: amount
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
