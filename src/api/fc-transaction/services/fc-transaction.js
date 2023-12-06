'use strict';

/**
 * fc-transaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::fc-transaction.fc-transaction');
