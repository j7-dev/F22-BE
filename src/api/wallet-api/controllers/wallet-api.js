"use strict";

/**
 * A set of functions called "actions" for `wallet-api`
 */

module.exports = {
  balance: async (ctx, next) => {
    try {
      // 取的 query string 的 userId
      const { userId } = ctx.request.query;
      /**
       * @ref https://forum.strapi.io/t/how-to-use-entityservice-for-user/23087
       * 取得 userId 的初始 balance
       * 這個 userData 只是一個範例，沒有用到
       * ⚠️ 做一般 user 的 CRUD 要用 "plugin::users-permissions.user"
       */

      const userData = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          fields: ["balance"],
          populate: ["role"], // populate 會把關聯的資料取出來，例如 user 關聯 role 你可以把 role 的詳細資料易起帶出來
        }
      );

      // 取得 userId 的所有 point-record
      const entries = await strapi.entityService.findMany(
        "api::point-record.point-record",
        {
          fields: ["title", "amount"],
          filters: { userId },
        }
      );

      // 計算 balance ，就是遍歷 entries 的 amount 加總起來
      // 白話就是  把這 user 的每筆 record 的 amount 加總起來
      const balance = entries.reduce((acc, cur) => {
        return acc + cur.amount;
      }, 0);

      const updateResult = await strapi.entityService.update(
        "plugin::users-permissions.user",
        userId,
        {
          data: {
            balance,
          },
        }
      );

      ctx.body = {
        status: "200",
        message: "get balance success",
        data: updateResult,
      };
    } catch (err) {
      ctx.body = err;
    }
  },
  add: async (ctx, next) => {
    try {
      const { title, description, amount, by, userId } = ctx.request.body;
      /**
       * @ref https://docs.strapi.io/dev-docs/api/entity-service/crud#create
       * 創建一筆 point-record
       */
      const entry = await strapi.entityService.create(
        "api::point-record.point-record",
        {
          data: {
            title,
            description,
            amount,
            by,
            userId,
          },
        }
      );
      ctx.body = {
        status: "200",
        message: "added success",
        data: {
          entry,
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
  deduct: async (ctx, next) => {
    try {
      const { title, description, amount, by, userId } = ctx.request.body;
      /**
       * @ref https://docs.strapi.io/dev-docs/api/entity-service/crud#create
       * 創建一筆 point-record
       */
      const entry = await strapi.entityService.create(
        "api::point-record.point-record",
        {
          data: {
            title,
            description,
            amount,
            by,
            userId,
          },
        }
      );
      ctx.body = {
        status: "200",
        message: "deducted success",
        data: {
          entry,
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
