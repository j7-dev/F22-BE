module.exports = (plugin) => {

	plugin.contentTypes.role.schema.pluginOptions = {
			'content-manager': {
					visible: true,
			},
			'content-type-builder': {
					visible: true,
			},
	}
	return plugin;
};