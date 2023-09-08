'use strict';

/**
 * block-ip router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::block-ip.block-ip');
