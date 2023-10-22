'use strict'

const axios = require('axios')
const querystring = require('querystring')

/**
 * A set of functions called "actions" for `bti-gp`
 */

module.exports = {
  opengame: async (ctx, next) => {
    const apiUrl = process?.env?.BTI_OPEN_GAME_API_URL

    const query = ctx?.request?.query

    // 如果沒有帶參數就回 400
    const requiredFields = ['user_id']

    for (const field of requiredFields) {
      if (query?.[field] === undefined) {
        return ctx.badRequest(`${field} is required`)
      }
    }

    const { user_id } = query

    const btiTokenInfos = await strapi.entityService.findMany(
      'api::bti-token-info.bti-token-info',
      {
        filter: {
          user_id,
        },
        populate: {
          user_id: {
            fields: ['id', 'username'],
          },
        },
      }
    )

    if (btiTokenInfos.length < 1) {
      return ctx.badRequest(`can\'t find bti token info on user_id: ${user_id}`)
    }

    const args = {
      operatorToken: btiTokenInfos?.[0]?.token,
    }

    const queryString = querystring.stringify(args)

    const getResult = await axios.get(`${apiUrl}/?${queryString}`, {
      family: 4,
    })

    // ctx.type = 'text/html'
    ctx.body = getResult?.data
  },
}
