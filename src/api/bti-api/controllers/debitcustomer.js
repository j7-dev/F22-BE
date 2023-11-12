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

      const existDebitcustomerArray = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id", "after_balance"],
          filters: { req_id },
        }
      );

      if (existDebitcustomerArray.length > 0) {
        ctx.body = formatAsKeyValueText({
          error_code: "0",
          error_message: "No Error",
          balance: existDebitcustomerArray[0].after_balance,
          trx_id: existDebitcustomerArray[0].trx_id
        });
        return;
      }

      var krw_amount = 0;

      const update_balance_result = await strapi.service('api::wallet-api.wallet-api').add({
        user_id: cust_id,
        amount: -amount,
        title: 'bti-debitcustomer',
        type: 'CREDIT',
        by: 'bti-api',
        currency: 'KRW',
        ref_id: purchase_id,
        allowNegative: true
      })

      for (const balance of update_balance_result.balances) {
        if (balance.currency = "KRW") {
          krw_amount = balance.amount;
        }
      };

      const debitcustomer_result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: Math.floor(new Date().getTime()).toString(),
            cust_id: cust_id,
            amount: amount,
            req_id: req_id,
            purchase_id: purchase_id,
            after_balance: krw_amount,
            url: ctx.request.url,
            type: "debitcustomer",
          },
        }
      );

      ctx.body = formatAsKeyValueText({
        error_code: "0",
        error_message: "No Error",
        balance: krw_amount,
        trx_id: debitcustomer_result.trx_id
      });
    } catch (err) {
      ctx.body = err;
    }
  }
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