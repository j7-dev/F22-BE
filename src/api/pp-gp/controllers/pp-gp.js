'use strict'
const axios = require('axios').default
const _ = require('lodash')
const crypto = require('crypto')
/**
 * A set of functions called "actions" for `pp-gp`
 */

module.exports = {
  getCasinoGames: async (ctx, next) => {
    const apiUrl = process?.env?.PP_OPEN_GAME_API_URL
    const secureLogin = process?.env?.PP_SECURE_LOGIN

    // 要加密的原始字符串
    const originalString = `secureLogin=${secureLogin}`
    // 您的密鑰
    const secretKey = process?.env?.PP_SECRET_KEY
    // 將原始字符串和密鑰結合
    const stringToHash = originalString + secretKey
    // 建立 MD5 加密器
    const md5Hash = crypto.createHash('md5')
    // 更新加密器的內容
    md5Hash.update(stringToHash)
    // 進行加密並取得加密後的十六進位字串
    const hash = md5Hash.digest('hex')

    const queryParams = {
      secureLogin,
      hash,
    }
    const queryString = new URLSearchParams(queryParams).toString()

    try {
      const getResult = await axios.post(
        `${apiUrl}/getCasinoGames?${queryString}`,
        null,
        {
          family: 4,
        }
      )

      ctx.body = getResult?.data
    } catch (err) {
      ctx.body = err.response.data
    }
  },
}
