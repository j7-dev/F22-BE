"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  debitcustomer: async (ctx, next) => {
    ctx.type = 'text/plain';
    try {
      // 取的 query string 的 auth_token
      const { cust_id, amount, req_id, agent_id, customer_id, purchase_id } = ctx.request.query;

      const result = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id","after_balance"],
          filters: { req_id },
        }
      );
      console.log(result);
      if (result.length > 0) {
        ctx.body = formatAsKeyValueText({
          error_code: "0",
          error_message: "No Error",
          balance: result[0].after_balance,
          trx_id: result[0].trx_id
        });
        return;
      }

      console.log("debitcustomer - start update balance");
      const body = {
        user_id: cust_id,
        amount: -amount,
        title: 'bti-debitcustomer',
        type: 'MANUAL',
        by: 'ADMIN',
        currency: 'KRW',
        allowNegative: true
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
        return;
      }
      console.log("debitcustomer - end update balance");

      const debitcustomer_result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: cust_id + purchase_id + req_id,
            cust_id: cust_id,
            amount: amount,
            req_id: req_id,
            purchase_id: purchase_id,
            after_balance:krw_amount,
            url: ctx.request.url,
            type: "debitcustomer",
          },
        }
      )

      ctx.body = formatAsKeyValueText({
        error_code: "0",
        error_message: "No Error",
        balance: krw_amount,
        trx_id: debitcustomer_result.trx_id
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