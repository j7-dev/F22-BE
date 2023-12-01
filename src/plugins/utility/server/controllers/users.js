'use strict'

module.exports = ({ strapi }) => ({
  /**
   * 檢查用是否被註冊
   * @returns { boolean } - true if user is registered
   */
  async canRegister(ctx) {
    const query = ctx?.request?.query
    const username = query?.username?.toLowerCase()
    const email = query?.email?.toLowerCase()
    const phone = query?.phone?.toLowerCase()
    const or = []

    if (username) {
      or.push({ username })
    }
    if (email) {
      or.push({ email })
    }
    if (phone) {
      or.push({ phone })
    }

    // find the user
    const user = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      {
        filters: {
          $or: or,
        },
      }
    )
    const available = user.length === 0

    ctx.body = {
      status: '200',
      message: `${
        available ? 'available' : 'registered, please try another one'
      }`,
      data: available,
    }
  },

  /**
   * 用 username 找 user_id
   */
  async getUserId(ctx) {
    const query = ctx?.request?.query
    const username = query?.username

    // find the user
    const users = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      {
        filters: {
          username,
        },
      }
    )
    if (users.length === 0) {
      ctx.body = {
        status: '200',
        message: `user not found`,
        data: null,
      }
    } else {
      const user = users?.[0]
      ctx.body = {
        status: '200',
        message: `find user_id success`,
        data: {
          user_id: user?.id,
        },
      }
    }
  },

  /**
   * 取得用戶的額外資訊
   */
  async getUserAdditionalInfo(ctx) {
    const query = ctx?.request?.query
    const user_id = query?.user_id

    if (!user_id) {
      return ctx.badRequest(`cant find user id`)
    }

    // get last debit
    const latestBet = await strapi.entityService.findMany(
      'api::transaction-record.transaction-record',
      {
        fields: ['createdAt'],
        filters: {
          user: user_id,
          type: 'DEBIT',
          status: 'SUCCESS',
        },
        sort: { createdAt: 'desc' },
        limit: 1,
      }
    )

    // find the referral
    const referrals = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      {
        fields: ['id'],
        filters: {
          referrer: user_id,
        },
      }
    )

    ctx.body = {
      status: '200',
      message: `get UserAdditionalInfo success`,
      data: {
        latestBetAt: latestBet.length ? latestBet[0]?.createdAt : null,
        referrals: referrals.length,
      },
    }
  },
})
