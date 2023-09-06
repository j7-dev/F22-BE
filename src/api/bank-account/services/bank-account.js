'use strict';

/**
 * bank-account service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bank-account.bank-account');
