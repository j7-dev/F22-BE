'use strict';

module.exports = {
  updateBalance: async (ctx) => {
    try {
      // Read from POST body
      const { amount, userId } = ctx.request.body;


      await strapi.db.transaction(async ({ trx, rollback, commit, onCommit, onRollback }) => {
          // Find the user
          const user = await strapi.entityService.findOne("plugin::users-permissions.user",
					userId, {
						fields: ['cash_balance'],
					});

          // Check if the user exists
          if (!user) {
              return ctx.badRequest(null, 'User not found');
          }
          // TODO Check if the user has enough balance
          if (user.cash_balance < amount) {
              return ctx.badRequest(null, 'Insufficient balance');
          }



          // Update the user balance

					const updateResult = await strapi.entityService.update("plugin::users-permissions.user",
					userId,{
						data: {
							cash_balance: user.cash_balance + amount,
						},
					})

          // respond
          ctx.body = {
            status: "200",
            message: "updateBalance success",
            data: updateResult
          };
        });

    } catch (err) {
      ctx.body = err;
    }
  }
};