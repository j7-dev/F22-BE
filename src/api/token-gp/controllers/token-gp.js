'use strict'
const axios = require('axios')
const crypto = require('crypto')

/**
 * A set of functions called "actions" for `token-gp`
 */

module.exports = {
  opengame: async (ctx, next) => {
    const apiUrl = process?.env?.TOKEN_API_URL
    const agentId = process?.env?.TOKEN_AGENT_ID
    const apiKey = process?.env?.TOKEN_API_KEY

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

    if (
      getResult?.data?.statuscode === '0' &&
      getResult?.data?.message === 'OK'
    ) {
      const uid = getResult?.data?.uid
      const md5 = crypto.createHash('md5')
      console.log('⭐  md5:', `${agentId}|${apiKey}|${uid}`)

      md5.update(`${agentId}|${apiKey}|${uid}`)
      const hash = md5.digest('hex')

      ctx.body = {
        ...getResult?.data,
        hash,
      }
    } else {
      ctx.body = getResult?.data
    }
  },
}
