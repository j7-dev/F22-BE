// @ts-nocheck
'use strict'

const axios = require('axios').default
const { nanoid } = require('nanoid')
/**
 * A set of functions called "actions" for `evo-gp`
 */

module.exports = {
  tablelist: async (ctx, next) => {
    const apiUrl = process.env?.EVO_API_URL
    const username = process.env?.EVO_CASINO_KEY
    const password = process.env?.EVO_TOKEN

    const instance = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      auth: {
        username: username,
        password: password,
      },
    })

    const getResult = await instance.get(`/${username}/tablelist`)
    ctx.body = getResult?.data
  },
  opengame: async (ctx, next) => {
    const apiUrl = process?.env?.EVO_OPEN_GAME_API_URL
    const key = process?.env?.EVO_CASINO_KEY
    const token = process?.env?.EVO_TOKEN
    const user = ctx?.state?.user
    const config = ctx?.request?.body?.config
    if (!ctx.state.user) {
      return ctx.unauthorized()
    }
    const uuid = user?.uuid
    const user_id = user?.id
    const sids = await strapi.entityService.findMany(
      'api::evo-session-info.evo-session-info',
      {
        filters: {
          user_id,
        },
        sort: { createdAt: 'desc' },
      }
    )

    let sid = ''
    if (sids.length === 0) {
      const createResult = await strapi.entityService.create(
        'api::evo-session-info.evo-session-info',
        {
          data: {
            session_id: nanoid(),
            user_id,
          },
        }
      )
      console.log('⭐  createResult:', createResult)
      sid = createResult?.session_id
    } else {
      sid = sids?.[0].session_id
    }

    const reqHost = ctx?.request?.headers?.host

    const body = {
      uuid,
      player: {
        id: user?.id,
        update: true,
        firstName: 'smtbet7',
        lastName: user?.username,
        country: 'KR',
        nickname: user?.username,
        language: 'ko',
        currency: 'KRW',
        session: {
          id: sid,
          ip: reqHost,
        },
        group: {
          id: 'rn7ixj24vtakua35',
          action: 'assign',
        },
      },
      config,
    }

    console.log('⭐  body:', JSON.stringify(body))

    console.log('⭐  apiUrl:', `${apiUrl}/${key}/${token}`)

    const getResult = await axios.post(`${apiUrl}/${key}/${token}`, body, {
      family: 4,
    })

    ctx.body = getResult?.data
  },
}
