'use strict'
const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)
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
        fields: ['id', 'is_claimed'],
        populate: {
          user: {
            fields: ['id'],
          },
          period: {
            fields: '*',
          },
        },
      }
    )
    const start_datetime = coupon?.period?.start_datetime
    const end_datetime = coupon?.period?.end_datetime
    const is_before = dayjs().isBefore(start_datetime)
    const is_after = dayjs().isAfter(end_datetime)

    // const startTime = start_datetime ? dayjs(start_datetime) : null
    // const endTime = end_datetime ? dayjs(end_datetime) : null

    // 1. 是否是這個用戶的?
    // 2. 是否已經被領取
    // 3. 是否在時間內，可被領取

    // 檢查要領取的用戶是否與這優惠券發放對象一樣
    if (coupon?.user?.id !== user_id) {
      return ctx.badRequest(`coupon_id is not for this user`)
    }

    if (coupon?.is_claimed) {
      return ctx.badRequest(`this coupon_id is already claimed`)
    }

    // 如果沒有設end time 或是在時間內

    if (
      start_datetime &&
      end_datetime &&
      !dayjs().isBetween(start_datetime, end_datetime)
    ) {
      return ctx.badRequest(`this coupon_id is not in period`)
    }
    if (start_datetime && !end_datetime) {
      if (is_before) {
        return ctx.badRequest(`this coupon_id can't be claimed yet`)
      }
    }
    if (!start_datetime && end_datetime) {
      if (is_after) {
        return ctx.badRequest(`this coupon_id is expired, can't claimed`)
      }
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

  add: async (ctx, next) => {
    const body = ctx.request.body
    const operator = ctx?.state?.user

    const requiredFields = [
      'amount',
      'amount_type',
      'currency',
      'title',
      'user_id',
    ]

    for (const field of requiredFields) {
      if (body?.[field] === undefined) {
        return ctx.badRequest(`${field} is required`)
      }
    }

    const createResult = await strapi.entityService.create(
      'api::coupon.coupon',
      {
        data: {
          title: body?.title,
          description: `coupon added by ${operator?.display_name} #${operator?.id}`,
          coupon_type: 'FIXED',
          coupon_amount: body?.amount,
          currency: body?.currency,
          amount_type: body?.amount_type,
          is_claimed: true,
          user: body?.user_id,
        },
      }
    )
    ctx.body = {
      status: 200,
      message: 'add coupon success',
      data: createResult,
    }
  },
})
