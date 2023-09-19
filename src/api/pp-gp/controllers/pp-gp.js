'use strict'
const axios = require('axios').default
const _ = require('lodash')
/**
 * A set of functions called "actions" for `pp-gp`
 */

module.exports = {
  getCasinoGames: async (ctx, next) => {
    const apiUrl = process?.env?.PP_OPEN_GAME_API_URL
    const secureLogin = process?.env?.PP_SECURE_LOGIN
    const hash = process?.env?.PP_HASH
    const queryParams = {
      secureLogin,
      hash,
    }
    const queryString = new URLSearchParams(queryParams).toString()

    try {
      const getResult = await axios.post(
        `${apiUrl}/getCasinoGames?${queryString}`,
        null,
        {
          family: 4,
        }
      )

      ctx.body = getResult?.data
    } catch (err) {
      ctx.body = err.response.data
    }
  },
}
