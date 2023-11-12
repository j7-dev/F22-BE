'use strict'

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  validatetoken: async (ctx, next) => {
    ctx.type = 'text/plain';
    var userInfo;

    try {
      // 取的 query string 的 auth_token
      const { auth_token } = ctx.request.query

      if (auth_token == undefined) {
        ctx.body = formatAsKeyValueText({
          error_code: '-3',
          error_message: 'TokenNotValid',
        });
        return
      }

      //get user info by token
      const token = auth_token;
      const userInfoArray = await strapi.entityService.findMany(
        'api::bti-token-info.bti-token-info',
        {
          filters: {
            token,
          },
          populate: ['user_id'],
          sort: { createdAt: 'desc' },
        }
      );

      userInfo = userInfoArray[0];

      if (userInfo == undefined) {
        ctx.body = formatAsKeyValueText({
          error_code: '-3',
          error_message: 'TokenNotValid',
        });
        return
      }

      //get balance by user id
      const userBalanceArray = await strapi
        .service('api::wallet-api.wallet-api')
        .get({user_id: userInfo.user_id.id});

      const userBalance = userBalanceArray[0];

      if (userBalance == undefined) {
        ctx.body = formatAsKeyValueText({
          error_code: '-3',
          error_message: 'TokenNotValid',
        });
        return
      }

      ctx.body = formatAsKeyValueText({
        error_code: '0',
        error_message: 'No Error',
        cust_id: userInfo.user_id.id,
        balance: parseFloat(userBalance.amount),
        cust_login: userInfo.user_id.username,
        city: 'KR',
        country: 'KR',
        currency_code: userInfo.currency,
      });
    } catch (err) {
      ctx.body = formatAsKeyValueText({
        error_code: '-1',
        error_message: 'GeneralError',
        err: err
      });
      return
    }
  }
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