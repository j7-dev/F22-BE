'use strict'
const axios = require('axios')

/**
 * A set of functions called "actions" for `token-gp`
 */

module.exports = {
  opengame: async (ctx, next) => {
    const apiUrl = process?.env?.TOKEN_API_URL

    const body = ctx?.request?.body
    body.hash = '34536fd35da6877bcf8623ecee32d185'
    body.agent_id = 'roca'
    console.log('⭐  body:', body)
    console.log('⭐  api:', `${apiUrl}/api/auth/`)

    const getResult = await axios.post(`${apiUrl}/api/auth/`, body, {
      family: 4,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    ctx.body = getResult?.data
  },
}
