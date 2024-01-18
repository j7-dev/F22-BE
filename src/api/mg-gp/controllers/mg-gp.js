// @ts-nocheck
'use strict'

const axios = require('axios').default
const { nanoid } = require('nanoid')
/**
 * A set of functions called "actions" for `evo-gp`
 */

module.exports = {
  tablelist: async (ctx, next) => {
    const apiUrl = process.env?.MG_API_URL
    const agentCode = process.env?.MG_AGENT_CODE

    const instance = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      auth: {
        agentCode: agentCode,
      },
    })

    const getResult = await instance.get(`/${agentCode}/games`)
    ctx.body = getResult?.data
  },
  opengame: async (ctx, next) => {
    const apiUrl = process?.env?.MG_API_URL
    const key = process?.env?.EVO_CASINO_KEY
    const token = process?.env?.EVO_TOKEN
    const user = ctx?.state?.user
    const config = ctx?.request?.body?.config
    const body = ctx?.request?.body

    if (!ctx.state.user) {
      return ctx.unauthorized()
    }
    const uuid = user?.uuid
    const user_id = user?.id
    const playerId = 'roka_' + user?.username
    // const reqHost = ctx?.request?.headers?.host

    const body = {
      contentCode: body.contentCode,
      platform: 'Desktop',
      langCode: 'ko'
    }

    console.log('⭐  body:', JSON.stringify(body))

    console.log('⭐  apiUrl:', `${apiUrl}/${key}/${token}`)

    try {
      const getResult = await axios.post(`${apiUrl}/agents/${agentCode}/players/${playerId}/sessions`, body)
      ctx.body = getResult?.data
    } catch (error) {
      console.log('⭐  error:', error)
      ctx.body = JSON.stringify(error)
    }
  },
}
