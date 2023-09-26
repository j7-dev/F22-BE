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

      // 取得 reserve_id 的所有 record
      const reserve = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id","after_balance"],
          filters: { reserve_id },
        }
      );
      console.log(reserve);
      if (reserve.length == 0) {
        ctx.body = formatAsKeyValueText({
          error_code: "0",
          error_message: "ReserveID Not Exist",
          trx_id: 0,
          balance: 0
        });
        return;
      }

      var reserve_amount = 0;
      var debitreserve_amount = 0;
      var available_amount = 0;

      for (const item of reserve) {
        if (item.req_id === req_id) {
          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "No Error",
            trx_id: item.trx_id,
            balance: item.after_balance
          });
          return;
        }

        if (item.type === "reserve") {
          reserve_amount += item.amount;
        }

        if (item.type === "debitreserve") {
          debitreserve_amount += item.amount;
        }
      }
      available_amount = reserve_amount - debitreserve_amount;

      if(available_amount<amount){
        ctx.body = formatAsKeyValueText({
          error_code: "0",
          error_message: "Total DebitReserve amount larger than Reserve amount"
        });
        return;
      }
      const result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: cust_id + reserve_id + req_id,
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

      ctx.body = formatAsKeyValueText({
        error_code: "0",
        error_message: "No Error",
        trx_id: cust_id + reserve_id + req_id,
        balance: reserve[0].after_balance
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