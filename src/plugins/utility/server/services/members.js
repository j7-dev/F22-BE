'use strict'
const { removeUndefinedKeys } = require('./utils')

module.exports = ({ strapi }) => ({
  async getOnlineMembers(args) {
    const start = args?.start
    const end = args?.end

    const defaultFilters = {
      createdAt: {
        $gt: start,
        $lt: end,
      },
    }

    const filters = removeUndefinedKeys(defaultFilters)

    const allLoginRecords = await strapi.entityService.findMany(
      'api::login-detail.login-detail',
      {
        fields: ['id'],
        filters,
        populate: {
          user: {
            fields: ['id', 'username'],
            populate: {
              role: {
                fields: ['id', 'type'],
              },
            },
          },
        },
      }
    )

    const formattedRecords = allLoginRecords.map((record) => ({
      user_id: record.user.id,
      roleType: record.user.role.type,
    }))

    const membersRecords = formattedRecords.filter(
      (record) => record.roleType === 'admin'
    )

    const members = Array.from(
      new Set(membersRecords.map((record) => record.user_id))
    )

    return members.length
  },
  async getMembersByAgent(args) {
    const start = args?.start
    const end = args?.end
    const agent_id = args?.agent_id
    const top_agent_id = args?.top_agent_id
    const fields = args?.fields || '*'
    const role_type = args?.role_type

    const defaultFilters = {
      top_agent: top_agent_id,
      agent: agent_id,
      createdAt: {
        $gt: start,
        $lt: end,
      },
      role: {
        type: role_type,
      },
    }

    const filters = removeUndefinedKeys(defaultFilters)

    const allMembers = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      {
        fields,
        filters,
      }
    )

    return allMembers
  },
})
