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
    const user_id = ctx?.state?.user?.id

    if (!user_id) {
      ctx.badRequest("can't find user_id")
    }

    const body = ctx?.request?.body
    body.hash = '34536fd35da6877bcf8623ecee32d185'
    body.agent_id = agentId

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

      md5.update(`${agentId}|${apiKey}|${uid}`)
      const hash = md5.digest('hex')

      // 找用戶在 token_uid_info TABLE 裡面有沒有 uid
      const findUserInfo = await strapi.entityService.findMany(
        'api::token-uid-info.token-uid-info',
        {
          populate: {
            user_id: {
              fields: ['id'],
            },
          },
          filters: { user_id },
        }
      )

      if (findUserInfo.length > 0) {
        // 有就更新
        const id = findUserInfo?.[0]?.id
        const updateUserInfo = await strapi.entityService.update(
          'api::token-uid-info.token-uid-info',
          id,
          {
            data: {
              uid,
            },
          }
        )
      } else {
        // 沒有就新增
        const createUserInfo = await strapi.entityService.create(
          'api::token-uid-info.token-uid-info',
          {
            data: {
              uid,
              user_id,
              currency: 'KRW',
            },
          }
        )
      }

      ctx.body = {
        ...getResult?.data,
        hash,
      }
    } else {
      ctx.body = getResult?.data
    }
  },
  startgame: async (ctx, next) => {
    const apiUrl = process?.env?.TOKEN_API_URL
    const agentId = process?.env?.TOKEN_AGENT_ID
    const apiKey = process?.env?.TOKEN_API_KEY
    const user_id = ctx?.state?.user?.id

    if (!user_id) {
      ctx.badRequest("can't find user_id")
    }

    const body = ctx?.request?.body
    body.hash = '34536fd35da6877bcf8623ecee32d185'
    body.agent_id = agentId

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

      md5.update(`${agentId}|${apiKey}|${uid}`)
      const hash = md5.digest('hex')

      // 找用戶在 token_uid_info TABLE 裡面有沒有 uid
      const findUserInfo = await strapi.entityService.findMany(
        'api::token-uid-info.token-uid-info',
        {
          populate: {
            user_id: {
              fields: ['id'],
            },
          },
          filters: { user_id },
        }
      )

      if (findUserInfo.length > 0) {
        // 有就更新
        const id = findUserInfo?.[0]?.id
        const updateUserInfo = await strapi.entityService.update(
          'api::token-uid-info.token-uid-info',
          id,
          {
            data: {
              uid,
            },
          }
        )
      } else {
        // 沒有就新增
        const createUserInfo = await strapi.entityService.create(
          'api::token-uid-info.token-uid-info',
          {
            data: {
              uid,
              user_id,
              currency: 'KRW',
            },
          }
        )
      }

      const startgameResult = await axios.post(
        `${apiUrl}/api/startgame/`,
        {
          agent_id: agentId,
          gtype: body?.gtype,
          uid,
          groupId: 'g7', //100,000-10,000,000
          hash,
        },
        {
          family: 4,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      ctx.body = {
        ...startgameResult?.data,
        hash,
        uid,
      }
    } else {
      ctx.body = getResult?.data
    }
  },
}
