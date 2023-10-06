"use strict";

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  balance: async (ctx, next) => {
    var userInfo;

    try {
      // 取的 query string 的 auth_token
      const { token } = ctx.request.query

      if (token == undefined) {
        ctx.body = {
          status: 'failure',
          balance: '0'
        };
        return
      }

      //get user info by token
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
        ctx.body = {
          status: 'failure',
          balance: '0'
        };
        return
      }

      //get balance by user id
      const userBalanceArray = await strapi
        .service('api::wallet-api.wallet-api')
        .get({user_id: userInfo.id});

      const userBalance = userBalanceArray[0];

      if (userBalance == undefined) {
        ctx.body = {
          status: 'failure',
          balance: '0'
        };
        return
      }

      ctx.body = {
        status: 'success',
        balance: userBalance.amount
      };
    } catch (err) {
      ctx.body = {
        status: 'failure',
        balance: '0'
      };
      return
    }
  }
};