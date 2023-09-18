'use strict';

/**
 * pp-transaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pp-transaction.pp-transaction');
