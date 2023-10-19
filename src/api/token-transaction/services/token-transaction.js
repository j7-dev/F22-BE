'use strict';

/**
 * token-transaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::token-transaction.token-transaction');
