'use strict'

module.exports = ({ strapi }) => ({
  /**
   *
   * @param {string} roleType
   * @returns
   */
  async getRoleId(roleType) {
    const agentRole = await strapi.entityService.findMany(
      'plugin::users-permissions.role',
      {
        filters: {
          type: roleType,
        },
      }
    )
    const agentRoleId = agentRole?.[0].id

    return agentRoleId
  },
})
