'use strict'

/**
 * coupon router
 */

const { createCoreRouter } = require('@strapi/strapi').factories

const defaultRouter = createCoreRouter('api::coupon.coupon')

const customRouter = (innerRouter, extraRoutes = []) => {
  let routes
  return {
    get prefix() {
      return innerRouter.prefix
    },
    get routes() {
      if (!routes) routes = innerRouter.routes.concat(extraRoutes)
      return routes
    },
  }
}

const extraRoutes = [
  {
    method: 'POST',
    path: '/coupon/claim',
    handler: 'coupon.claim',
    config: {
      policies: [],
      middlewares: [],
    },
  },
]
module.exports = customRouter(defaultRouter, extraRoutes)
