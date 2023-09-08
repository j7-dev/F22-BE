'use strict';

/**
 * user-relationship service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-relationship.user-relationship');
