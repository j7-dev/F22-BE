'use strict'

/**
 * cms-post controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('api::cms-post.cms-post', {
  async getSiteNotify(ctx) {
    if (!ctx.state.user) {
      return ctx.unauthorized()
    }

    const user = ctx.state.user
    const uuid = user.uuid

    const entries = await strapi.entityService.findMany(
      'api::cms-post.cms-post',
      {
        filters: {
          $and: [
            {
              post_type: 'siteNotify',
            },
          ],
        },
      }
    )

    ctx.body = {
      status: '200',
      message: 'get site notify success',
      data: entries,
    }
  },
})
