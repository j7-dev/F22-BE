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

      //parameter check
      if (auth_token === undefined) {
        ctx.body = formatAsKeyValueText({
          error_code: "-3",
          error_message: "TokenNotValid"
        });
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
          ctx.body = formatAsKeyValueText({
            error_code: "-3",
            error_message: "TokenNotValid"
          });
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
        ctx.body = formatAsKeyValueText({
          error_code: "-3",
          error_message: "TokenNotValid"
        });
        return;
      }

      //get balance by user id
      try {
        const result = await strapi
          .service('api::wallet-api.wallet-api')
          .get(formattedInfos[0])

        ctx.body = formatAsKeyValueText({
          status: "success",
          balance: parseFloat(result[0].amount)
        });
      } catch (err) {
        ctx.body = formatAsKeyValueText({
          error_code: "-3",
          error_message: "TokenNotValid"
        });
        return;
      }

    } catch (err) {
      ctx.body = formatAsKeyValueText({
        error_code: "-3",
        error_message: "TokenNotValid"
      });
      return;
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