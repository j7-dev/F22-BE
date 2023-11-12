'use strict'

/**
 * coupon service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::coupon.coupon', {
  handleClaimCoupon: async (event) => {
    const { result } = event
    const { coupon_amount, id, title, currency, amount_type } = result
    const coupon = await strapi.entityService.findOne(
      'api::coupon.coupon',
      id,
      {
        fields: ['id'],
        populate: {
          user: {
            fields: ['id'],
          },
        },
      }
    )

    const user_id = coupon?.user?.id

    // 將 coupon 寫入 balance
    const addResult = await strapi.service('api::wallet-api.wallet-api').add({
      user_id,
      amount: coupon_amount,
      title: `Coupon Claimed ${title} coupon_id #${id}`,
      type: 'COUPON',
      by: 'SYSTEM',
      currency,
      amount_type,
    })

    return addResult
  },
})
