'use strict'
const axios = require('axios')
/**
 * A set of functions called "actions" for `igx-gp`
 */

module.exports = {
  login11a: async (ctx, next) => {
    const apiUrl = process?.env?.IGX_11A_API_URL
    const apiKey = process?.env?.IGX_API_KEY
    const angentCode = process?.env?.IGX_AGENT_CODE
    const key = process?.env?.EVO_CASINO_KEY
    const token = process?.env?.EVO_TOKEN
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

    const getResult = await axios.post(
      endpoint,
      {},
      {
        family: 4,
      }
    )

    ctx.body = getResult?.data
  },
  login11b: async (ctx, next) => {
    const apiUrl = process?.env?.IGX_11B_API_URL
    const otp_id = process?.env?.IGX_OTP_ID

    const body = ctx?.request?.body
    const { login_id, lang = 'ko' } = body

    const getResult = await axios.post(
      apiUrl,
      {
        login_id,
        lang,
        otp_id,
      },
      {
        family: 4,
      }
    )

    ctx.body = getResult?.data
  },
}
