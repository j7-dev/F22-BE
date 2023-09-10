'use strict';

/**
 * balance service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::balance.balance');
