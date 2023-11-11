'use strict'
const { nanoid } = require('nanoid')

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
    console.log('⭐  user:', user)
    const available = user.length === 0

    ctx.body = {
      status: '200',
      message: `${
        available ? 'available' : 'registered, please try another one'
      }`,
      data: available,
    }
  },
})
