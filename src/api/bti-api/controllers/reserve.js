"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  reserve: async (ctx, next) => {
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, amount, agent_id, customer_id, extsessionID } = ctx.request.query;
      //TODO: check user if exist
      //TODO: check balance if enough
      //TODO: check reserve record if exist

      const parameters = {
        "type": "reserve",
        "by": "bti",
        "title": reserve_id,
        "amount": amount,
        "user_id": cust_id,
        "currency": "KRW"
      };

      const result = await strapi
        .service('api::wallet-api.wallet-api')
        .add(parameters)

      // respond
      ctx.body = {
        status: '200',
        message: 'updateBalance success',
        data: result,
      }

      // 取得 reserve_id 的所有 record
      const entries = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["ID", "RESERVE_ID", "TRX_ID", "CUST_ID", "AMOUNT"],
          filters: { reserve_id },
        }
      );

      if (entries.id !== undefined) {
        ctx.body = {
          error_code: "0",
          error_message: "No Error",
          trx_id: entries,
          balance: 0
        };
        return;
      }
      const create_bti_request_result = await strapi.entityService.create(
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
        balance: amount,
        result: result,
        create_bti_request_result:create_bti_request_result
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
