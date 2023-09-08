'use strict';

/**
 * transaction-record service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::transaction-record.transaction-record');
