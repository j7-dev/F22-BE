// @ts-nocheck
'use strict'

const axios = require('axios').default
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
    console.log(
      '⭐  response.request.res.socket.remoteAddress:',
      ctx?.res?.socket?.remoteAddress
    )
    const apiUrl = process?.env?.EVO_OPEN_GAME_API_URL
    const key = process?.env?.EVO_CASINO_KEY
    const token = process?.env?.EVO_TOKEN
    const body = ctx?.request?.body

    console.log('⭐  apiUrl:', `${apiUrl}/${key}/${token}`)

    const getResult = await axios.post(`${apiUrl}/${key}/${token}`, body, {
      family: 4,
    })

    ctx.body = getResult?.data
  },
}
