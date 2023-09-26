'use strict'
const omitBy = require('lodash/omitBy')

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

    const filters = omitBy(defaultFilters, (value) => value === undefined)

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
    return ''
  },
})
