'use strict'

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  validatetoken: async (ctx, next) => {
    var formattedInfos = {}
    ctx.type = 'text/plain';

    try {
      // 取的 query string 的 auth_token
      const { auth_token } = ctx.request.query

      //get user info by token
      try {
        const token = auth_token
        const infos = await strapi.entityService.findMany(
          'api::bti-token-info.bti-token-info',
          {
            filters: {
              token,
            },
            populate: ['user_id'],
            sort: { createdAt: 'desc' },
          }
        )

        //DB result validation
        if (infos == undefined) {
          ctx.body = formatAsKeyValueText({
            error_code: '-3',
            error_message: 'TokenNotValid',
          });
          return
        }

        //format DB result
        formattedInfos = infos.map((info) => ({
          id: info.id,
          session_id: info.session_id,
          created_at: info.createdAt,
          user_id: info.user_id,
          currency: 'KRW',
        }))

        //get balance by user id
        try {
          const result = await strapi
            .service('api::wallet-api.wallet-api')
            .get(formattedInfos[0])

          const jsonData = {
            error_code: '0',
            error_message: 'No error',
            cust_id: formattedInfos[0].user_id.id,
            balance: parseFloat(result[0].amount),
            cust_login: formattedInfos[0].user_id.username,
            city: 'KR',
            country: 'KR',
            currency_code: 'KRW',
          }

          ctx.body = formatAsKeyValueText(jsonData);

        } catch (err) {
          ctx.body = formatAsKeyValueText({
            error_code: '-3',
            error_message: 'TokenNotValid'
          });
          return
        }
      } catch (err) {
        ctx.body = formatAsKeyValueText({
          error_code: '-1',
          error_message: 'GeneralError'
        });
        return
      }
    } catch (err) {
      ctx.body = err
    }
  },
}

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