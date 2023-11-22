// @ts-nocheck
'use strict'
const axios = require('axios')
/**
 * A set of functions called "actions" for `igx-gp`
 */

module.exports = {
  login11a: async (ctx, next) => {
    const apiUrl = process?.env?.IGX_11A_API_URL
    const apiKey = process?.env?.IGX_API_KEY
    console.log('⭐  apiKey:', apiKey)
    const angentCode = process?.env?.IGX_AGENT_CODE
    const query = ctx?.request?.query
    const { login_id, name, channel = 'WEB' } = query

    // format url params
    const params = new URLSearchParams()
    params.append('login_id', login_id)
    params.append('name', name)
    params.append('channel', channel)
    params.append('api_key', apiKey)
    params.append('agent_code', angentCode)

    const endpoint = `${apiUrl}?${params.toString()}`

    console.log('⭐  endpoint:', endpoint)
    const getResult = await axios.get(
      endpoint,
      {},
      {
        family: 4,
      }
    )

    ctx.body = getResult?.data
  },
}
