'use strict';

/**
 * deposit-bonus service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::deposit-bonus.deposit-bonus');
