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
      var check_balance_result;

      //check user if exist
      try {
        check_balance_result = await strapi
          .service('api::wallet-api.wallet-api')
          .get({ user_id: cust_id })

      } catch (err) {
        ctx.body = formatAsKeyValueText({
          error_code: "-2",
          error_message: "Invalid Customer"
        });
        return;
      }

      // 取得 reserve_id 的所有 record
      const entries = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "reserve_id", "trx_id", "cust_id", "amount","type","after_balance"],
          filters: { reserve_id },
        }
      );

      for (const entry of entries) {
        if(entry.type ==="reserve"){
          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "No Error",
            trx_id: entry.trx_id,
            balance: entry.after_balance
          });
          return;
        }
      }

      console.log("reserve - start update balance");
      const body = {
        user_id: cust_id,
        amount: -amount,
        title: 'bti-reserve',
        type: 'DEBIT',
        by: 'bti-api',
        currency: 'KRW',
        ref_id: reserve_id
      }

      var krw_amount=0;
      try{
        const update_balance_result = await strapi.service('api::wallet-api.wallet-api').add(body)

        for (const balance of update_balance_result.balances) {
          if(balance.currency = "KRW"){
            krw_amount = balance.amount;
          }
        }
      } catch (err) {
        ctx.body = formatAsKeyValueText({
          error_code: "-4",
          error_message: "Insufficient Fund",
          balance: check_balance_result[0].amount
        });
        return;
      }
      console.log("reserve - end update balance");

      const create_reserve_result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: Math.floor(new Date().getTime()).toString(),
            cust_id: cust_id,
            amount: amount,
            reserve_id: reserve_id,
            req_id: null,
            purchase_id: null,
            url: ctx.request.url,
            after_balance: krw_amount,
            type: "reserve"
          },
        }
      )

      ctx.body = formatAsKeyValueText({
        error_code: "0",
        error_message: "No Error",
        trx_id: Math.floor(new Date().getTime()).toString(),
        balance: krw_amount
      });
    } catch (err) {
      ctx.body = err;
    }
  },
};

function formatAsKeyValueText(data) {
  let plainText = '';
  let isFirstLine = true;

  for (const key in data) {
    if (!isFirstLine) {
      plainText += '\n'; // Add newline if it's not the first line
    }
    plainText += `${key}=${data[key]}`;
    isFirstLine = false;
  }
  return plainText;
}