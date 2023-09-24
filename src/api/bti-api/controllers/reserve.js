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
        user_id: cust_id,
        amount: amount,
        title: '手動調整',
        type: 'MANUAL',
        by: 'ADMIN',
        currency: 'KRW'
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
      var entries = [];
      entries = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["ID", "RESERVE_ID", "TRX_ID", "CUST_ID", "AMOUNT"],
          filters: { reserve_id },
        }
      );

      if (entries.length > 0) {
        const parameters ={
          "user_id":cust_id
        };

        const get_user_balance_result = await strapi
          .service('api::wallet-api.wallet-api')
          .get(parameters);
          console.log(get_user_balance_result);

        ctx.body = {
          error_code: "0",
          error_message: "No Error",
          trx_id: entries[0].trx_id,
          balance: get_user_balance_result
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
            url: ctx.request.url,
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
