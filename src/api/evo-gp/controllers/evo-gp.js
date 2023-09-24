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

    try {
      const getResult = await instance.get(`/${username}/tablelist`)
      ctx.body = getResult?.data
    } catch (err) {
      ctx.body = err
    }
  },
  opengame: async (ctx, next) => {
    const apiUrl = process?.env?.EVO_OPEN_GAME_API_URL
    const key = process?.env?.EVO_CASINO_KEY
    const token = process?.env?.EVO_TOKEN
    const body = ctx?.request?.body

    try {
      const getResult = await axios.post(`${apiUrl}/${key}/${token}`, body)
      console.log('⭐  getResult', getResult)
      console.log(
        '⭐  getResult.request?.connection',
        getResult?.request?.connection?.remoteAddress
      )
      ctx.body = getResult?.data
    } catch (err) {
      console.log(
        '⭐  err.request?.connection',
        err?.request?.connection?.remoteAddress
      )
      ctx.body = err.response.data
    }
  },
}
