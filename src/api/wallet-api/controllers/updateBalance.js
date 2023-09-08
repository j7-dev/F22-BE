'use strict';
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    async updateBalance(ctx) {
      try {
        // Read from POST body
        const { amount, userId } = ctx.request.body;

        return await strapi.connections.default.transaction(async (transacting) => {
            // Find the user
            const user = await strapi.query('user', 'users-permissions').findOne({ id: userId }, null, { transacting });

            // Check if the user exists
            if (!user) {
                return ctx.badRequest(null, 'User not found');
            }
            // Check if the user has enough balance
            if (user.balance < amount) {
                return ctx.badRequest(null, 'Insufficient balance');
            }

            // Update the user balance
            user.balance += amount;

            // Save the user
            await strapi.query('user', 'users-permissions').update({ id: userId }, user, { transacting });

            // respond
            ctx.body = {
              status: "200",
              message: "updateBalance success",
              data: {
                user.id,
                user.balance
              },
            };
        
      }
    } catch (err) {
      ctx.body = err;
    }
  });
};