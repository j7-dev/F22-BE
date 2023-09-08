'use strict';

/**
 * block-ip service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::block-ip.block-ip');
