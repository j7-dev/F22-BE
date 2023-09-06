'use strict';

/**
 * vip service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::vip.vip');
