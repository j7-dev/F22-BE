'use strict';

/**
 * vip-level service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::vip-level.vip-level');
