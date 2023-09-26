"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  cancelreserve: async (ctx, next) => {
    ctx.type = 'text/plain';
    try {
      // 取的 query string 的 auth_token
      const { cust_id, reserve_id, agent_id, customer_id } = ctx.request.query;

      // 取得 reserve_id 的所有 record
      const reserves = await strapi.entityService.findMany(
        "api::bti-requests-singular.bti-requests-singular",
        {
          fields: ["id", "trx_id", "cust_id", "amount", "type", "reserve_id", "req_id", "after_balance"],
          filters: { reserve_id },
        }
      );

      //get balance by user id
      var current_balance = 0;
      try {
        const get_balance_result = await strapi
          .service('api::wallet-api.wallet-api')
          .get({user_id: cust_id})

          current_balance = parseFloat(get_balance_result[0].amount);
      } catch (err) {
        return;
      }
      
      console.log(reserves);
      if (reserves.length == 0) {
        ctx.body = formatAsKeyValueText({
          error_code: "0",
          error_message: "ReserveID Not Exist",
          trx_id: 0,
          balance: current_balance
        });
        return;
      }

      for (const item of reserves) {
        if (item.type === "cancelreserve") {
          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "No Error",
            trx_id: item.trx_id,
            balance: current_balance
          });
          return;
        }

        if (item.type === "debitreserve") {
          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "Already Debitted Reserve",
            balance: current_balance
          });
          return;
        }
      }

      const result = await strapi.entityService.create(
        'api::bti-requests-singular.bti-requests-singular',
        {
          data: {
            trx_id: cust_id + reserve_id,
            cust_id: cust_id,
            reserve_id: reserve_id,
            url: ctx.request.url,
            type: "cancelreserve"
          }
        }
      )

      console.log("cancelreserve - start update balance");
        const body = {
          user_id: cust_id,
          amount: reserves[0].amount,
          title: 'bti-cancelreserve',
          type: 'MANUAL',
          by: 'ADMIN',
          currency: 'KRW'
        }

        var krw_amount = 0;
        
        try {
          const update_balance_result = await strapi.service('api::wallet-api.wallet-api').add(body)
          console.log(update_balance_result);
          for (const balance of update_balance_result.balances) {
            if (balance.currency = "KRW") {
              krw_amount = balance.amount;
            }
          }

          ctx.body = formatAsKeyValueText({
            error_code: "0",
            error_message: "No Error",
            balance: krw_amount
          });
          return;
        } catch (err) {
          ctx.body = formatAsKeyValueText({
            error_code: "-1",
            error_message: "General Error",
            balance: krw_amount
          });
          return;
        }
        console.log("cancelreserve - end update balance");
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