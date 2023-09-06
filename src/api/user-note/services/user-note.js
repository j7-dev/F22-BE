'use strict';

/**
 * user-note service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-note.user-note');
