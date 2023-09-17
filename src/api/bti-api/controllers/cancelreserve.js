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
      const reserves = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["ID", "RESERVE_ID", "TRX_ID","CUST_ID","AMOUNT"],
          filters: { reserve_id },
        }
      );
      
      console.log(reserves);
      if(reserves.id == undefined){
          ctx.body = {
            error_code: "0",
            error_message: "ReserveID Not Exist",
            trx_id: 0,
            balance: 0
        };
        return;
      }

      ctx.body = {
        status: "200",
        message: "post cancelreserve success",
        data: {
          error_code: "error_code",
          error_message: "error_message",
          balance: 0
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
