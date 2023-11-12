'use strict'

/**
 * coupon controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('api::coupon.coupon', {
  claim: async (ctx, next) => {
    const body = ctx.request.body
    const { coupon_id } = body
    if (!ctx.state.user) {
      return ctx.unauthorized()
    }
    const user_id = ctx?.state?.user?.id
    console.log('⭐  user_id', user_id)
    // 如果沒有帶參數就回 400
    const requiredFields = ['coupon_id']

    for (const field of requiredFields) {
      if (body?.[field] === undefined) {
        return ctx.badRequest(`${field} is required`)
      }
    }

    const coupon = await strapi.entityService.findOne(
      'api::coupon.coupon',
      coupon_id,
      {
        fields: ['id'],
        populate: {
          user: {
            fields: ['id'],
          },
        },
      }
    )

    // 檢查要領取的用戶是否與這優惠券發放對象一樣
    if (coupon?.user?.id !== user_id) {
      return ctx.badRequest(`coupon_id is not for this user`)
    }

    const updateResult = await strapi.entityService.update(
      'api::coupon.coupon',
      coupon_id,
      {
        data: {
          is_claimed: true,
        },
      }
    )

    ctx.body = {
      status: 200,
      message: 'claim coupon success',
      data: updateResult,
    }
  },
})
