"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  reserve: async (ctx, next) => {
    ctx.type = 'text/plain';
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, amount, agent_id, customer_id, extsessionID } = ctx.request.query;

      //TODO: check user if exist
      if(cust_id == "invalidcustid"){
        ctx.body = {
            error_code: "-2",
            error_message: "Invalid Customer",
            balance: 0.00,
            trx_id: 123456789
        };
        return;
      }

      //TODO: check user balance
      if(amount>=9999){
        ctx.body = {
            error_code: "-4",
            error_message: "Insufficient Amount",
            balance: 100.00,
            trx_id: 123456789
        };
        return;
      }

      // 取得 reserve_id 的所有 record
      const entries = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["ID", "RESERVE_ID", "TRX_ID","CUST_ID","AMOUNT"],
          filters: { reserve_id },
        }
      );
      
      if(entries.id !== undefined){
          ctx.body = {
            error_code: "0",
            error_message: "No Error",
            trx_id: entries,
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
            type: "reserve",
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
