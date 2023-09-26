"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  commitreserve: async (ctx, next) => {
    ctx.type = 'text/plain';
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, agent_id, customer_id, purchase_id } = ctx.request.query;

      // 取得 reserve_id 的所有 record
      const reserve = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id", "after_balance"],
          filters: { reserve_id },
        }
      );
      console.log(reserve);
      var current_balance = 0;
      try {
        const result = await strapi
          .service('api::wallet-api.wallet-api')
          .get({ user_id: cust_id })

        current_balance = parseFloat(result[0].amount);
      } catch (err) {
        return;
      }

      if (reserve.length == 0) {
        ctx.body = formatAsKeyValueText({
          error_code: "0",
          error_message: "ReserveID Not Exist",
          balance: current_balance
        });
        return;
      }

      var accepted_reserve_amount = 0;
      var accepted_debitreserve_amount = 0;
      var available_amount = 0;

      for (const item of reserve) {
        if (item.type === "reserve") {
          accepted_reserve_amount += item.amount;
        }

        if (item.type === "debitreserve") {
          accepted_debitreserve_amount += item.amount;
        }

        if (item.type === "commitreserve") {
          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "No Error",
            balance: current_balance
          });
          return;
        }
      }


      const result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: Math.floor(new Date().getTime()),
            cust_id: cust_id,
            reserve_id: reserve_id,
            agent_id: agent_id,
            customer_id: customer_id,
            purchase_id: purchase_id,
            url: ctx.request.url,
            type: "commitreserve",
          },
        }
      )
      available_amount = accepted_reserve_amount - accepted_debitreserve_amount;

      //add available_amount back to player wallet
      console.log("commitreserve - start update balance");
      const body = {
        user_id: cust_id,
        amount: available_amount,
        title: 'bti-commitreserve',
        type: 'MANUAL',
        by: 'ADMIN',
        currency: 'KRW'
      }

      var krw_amount = 0;
      try {
        const update_balance_result = await strapi.service('api::wallet-api.wallet-api').add(body)

        for (const balance of update_balance_result.balances) {
          if (balance.currency = "KRW") {
            krw_amount = balance.amount;
          }
        }
      } catch (err) {
        ctx.body = formatAsKeyValueText({
          error_code: "-4",
          error_message: "Insufficient Amount",
          balance: current_balance
        });
        return;
      }
      console.log("commitreserve - end update balance");

      ctx.body = formatAsKeyValueText({
        error_code: "0",
        error_message: "No Error",
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