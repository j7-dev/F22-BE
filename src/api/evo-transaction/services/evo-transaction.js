'use strict';

/**
 * evo-transaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::evo-transaction.evo-transaction');
