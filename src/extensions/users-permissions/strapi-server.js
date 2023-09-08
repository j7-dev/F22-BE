module.exports = (plugin) => {

	plugin.contentTypes.role.schema.pluginOptions = {
			'content-manager': {
					visible: true,
			},
			'content-type-builder': {
					visible: true,
			},
	}

	plugin.controllers.user.mock = async (ctx) => {

		try {
      const qty = ctx.request.body?.qty || 10;
      const role = ctx.request.body?.role || 2;
			// 1 = authenticated, 2 = public, 3 = agent

			const latestUser = await strapi.db.query("plugin::users-permissions.user").findOne({
				select: ['id'],
				orderBy: { id: 'DESC' },
			});

			const latestUserId = latestUser?.id || null;

			for (let i = 0; i < qty; i++) {
				const createResult = await strapi.entityService.create('plugin::users-permissions.user', {
					data: {
						username: `user_${latestUserId + i}`,
						email: `user_${latestUserId +
							i}@gmail.com`,
						password: '123456',
						confirmed: true,
						role,
						blocked: false,
						cash_balance: 0,
						reward_point_balance:0,
					}
				});
				console.log("⭐  plugin.controllers.user.mock=  createResult", createResult)
			}

      ctx.body = {
        status: "200",
        message: `✅ mock ${qty} users success`,
        data: {
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  };

	plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/user/mock",
    handler: "user.mock",
    config: {
      prefix: "",
    },
  });
	return plugin;
};