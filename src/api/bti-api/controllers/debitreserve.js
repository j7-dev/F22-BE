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
      var genarated_trx_id = Math.floor(new Date().getTime()).toString();

      // 取得 reserve_id 的所有 record
      const existReservesArray = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id", "after_balance"],
          filters: { reserve_id },
        }
      );

      if (existReservesArray.length == 0) {
        ctx.body = formatAsKeyValueText({
          error_code: "0",
          error_message: "ReserveID Not Exist",
          trx_id: genarated_trx_id,
          balance: 0
        });
        return;
      }

      var total_reserve_amount = 0;
      var total_debitreserve_amount = 0;
      var available_amount = 0;
      var reserve_afterbalance = 0;

      for (const existReserveRecord of existReservesArray) {
        if (existReserveRecord.req_id === req_id) {
          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "No Error",
            trx_id: existReserveRecord.trx_id,
            balance: existReserveRecord.after_balance
          });
          return;
        }

        if (existReserveRecord.type === "reserve") {
          total_reserve_amount += existReserveRecord.amount;
          reserve_afterbalance = existReserveRecord.after_balance;
        }

        if (existReserveRecord.type === "debitreserve") {
          total_debitreserve_amount += existReserveRecord.amount;
        }

        if (existReserveRecord.type === "cancelreserve") {
          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "Already cancelled reserve",
            trx_id: genarated_trx_id,
            balance: reserve_afterbalance
          });
          return;
        }

        if (existReserveRecord.type === "commitreserve") {
          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "Already committed reserve",
            trx_id: genarated_trx_id,
            balance: reserve_afterbalance
          });
          return;
        }
      }

      available_amount = total_reserve_amount - total_debitreserve_amount;

      if (available_amount + 0.01 < amount) {
        ctx.body = formatAsKeyValueText({
          error_code: "0",
          error_message: "Total DebitReserve amount larger than Reserve amount",
          trx_id: genarated_trx_id,
          balance: reserve_afterbalance
        });
        return;
      }

      var final_debit_amount = amount;
      if (available_amount == amount - 0.01) {
        final_debit_amount = amount - 0.01;
      }

      const create_debitreserve_result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: genarated_trx_id,
            cust_id: cust_id,
            amount: final_debit_amount,
            reserve_id: reserve_id,
            req_id: req_id,
            ref_id: req_id,
            purchase_id: purchase_id,
            url: ctx.request.url,
            after_balance: reserve_afterbalance,
            type: "debitreserve",
          }
        }
      )

      ctx.body = formatAsKeyValueText({
        error_code: "0",
        error_message: "No Error",
        trx_id: genarated_trx_id,
        balance: reserve_afterbalance
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