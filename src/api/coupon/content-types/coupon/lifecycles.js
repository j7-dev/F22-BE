module.exports = {
  async afterUpdate(event) {
    const { result } = event
    const is_claimed = result?.is_claimed
    if (is_claimed) {
      const handleClaimCouponResult = await strapi
        .service('api::coupon.coupon')
        .handleClaimCoupon(event)
    }
  },
}
