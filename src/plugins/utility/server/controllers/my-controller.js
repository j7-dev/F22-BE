'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('utility')
      .service('myService')
      .getWelcomeMessage();
  },
});
