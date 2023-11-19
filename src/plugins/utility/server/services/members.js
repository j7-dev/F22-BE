'use strict'
const { removeUndefinedKeys } = require('./utils')
const dayjs = require('dayjs')

module.exports = ({ strapi }) => ({
  async getOnlineMembers(args) {
    const UTC9toUTC0 = global.appData.UTC9toUTC0
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
      user_id: record?.user?.id,
      roleType: record?.user?.role?.type,
    }))

    const membersRecords = formattedRecords.filter((record) => !!record.user_id)

    const members = Array.from(
      new Set(membersRecords.map((record) => record.user_id))
    )

    return members.length
  },
  /**
   * @param {Object} args
   * @param {string} args.agent_id
   * @param {string} [args.start]
   * @param {string} [args.end]
   * @param {string} [args.fields] - 欄位
   * @returns
   */
  async getMembersByAgent(args) {
    const start = args?.start
    const end = args?.end
    const agent_id = args?.agent_id
    const fields = args?.fields || '*'
    const UTC9toUTC0 = global.appData.UTC9toUTC0

    const defaultFilters = {
      agent: agent_id,
      createdAt: {
        $gt: start,
        $lt: end,
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
