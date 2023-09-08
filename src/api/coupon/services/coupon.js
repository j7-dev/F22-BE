'use strict';

/**
 * coupon service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::coupon.coupon');
