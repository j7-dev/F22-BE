"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  balance: async (ctx, next) => {
    var formattedInfos = {};
    ctx.type = 'text/plain';
    try {
      // 取的 query string 的 auth_token
      const { auth_token } = ctx.request.query;

      ctx.body = {
        status: "failure",
        balance: "0"
      };

      //parameter check
      if (auth_token === undefined) {
        return;
      }

      //get user info by token
      try {
        const session_id = auth_token;
        const infos = await strapi.entityService.findMany(
          'api::bti-token-info.bti-token-info',
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
      } catch (err) {
        return;
      }

      //get balance by user id
      try {
        const result = await strapi
          .service('api::wallet-api.wallet-api')
          .get(formattedInfos[0])

        ctx.body = {
          status: "success",
          balance: result[0].amount
        };
      } catch (err) {
        return;
      }

    } catch (err) {
      return;
    }
  },
};