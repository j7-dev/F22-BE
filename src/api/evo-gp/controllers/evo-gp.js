// @ts-nocheck
'use strict'

const axios = require('axios')
/**
 * A set of functions called "actions" for `evo-gp`
 */

module.exports = {
  tablelist: async (ctx, next) => {
    const apiUrl = process.env?.EVO_API_URL
    const username = process.env?.EVO_USERNAME
    const password = process.env?.EVO_PASSWORD

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
}
