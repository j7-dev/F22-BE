"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  validatetoken: async (ctx, next) => {
    var formattedInfos = {};
    try {
      // 取的 query string 的 auth_token
      const { auth_token } = ctx.request.query;

      if (auth_token === undefined) {
        ctx.body = {
          error_code: "-3",
          error_message: "TokenNotValid"
        };
        return;
      }

      //get user info by token
      try {
        const session_id = auth_token;
        const infos = await strapi.entityService.findMany(
          'api::evo-session-info.evo-session-info',
          {
            filters: {
              session_id,
            },
            populate: ['user_id'],
            sort: { createdAt: 'desc' },
          }
        )

        //DB result validation
        if (infos == undefined) {
          ctx.body = {
            error_code: "-3",
            error_message: "TokenNotValid"
          };
          return;
        }

        //format DB result
        formattedInfos = infos.map((info) => ({
          id: info.id,
          session_id: info.session_id,
          created_at: info.createdAt,
          user_id: info.user_id.id,
          currency: "KRW"
        }));

        //get balance by user id
        try {
          const result = await strapi
            .service('api::wallet-api.wallet-api')
            .get(formattedInfos[0])

          ctx.body = {
            error_code: "0",
            error_message: "No error",
            cust_id: formattedInfos.id,
            balance: parseFloat(result[0].amount),
            cust_login: formattedInfos.id,
            city: "KR",
            country: "KR",
            currency_code: "KRW"
          };
        } catch (err) {
          ctx.body = {
            error_code: "-3",
            error_message: "TokenNotValid",
            err: err
          };
          return;
        }


      } catch (err) {
        ctx.body = {
          error_code: "-3",
          error_message: "TokenNotValid",
          err: err
        };
        return;
      }
    } catch (err) {
      ctx.body = err;
    }
  },
};
