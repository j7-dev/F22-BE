'use strict';

/**
 * commission service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::commission.commission');
