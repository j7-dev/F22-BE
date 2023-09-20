'use strict'
/**
 * A set of functions called "actions" for `pp-gp`
 */
const axios = require('axios').default
const _ = require('lodash')
const crypto = require('crypto')
const { nanoid } = require('nanoid')
const apiUrl = process?.env?.PP_OPEN_GAME_API_URL
const secureLogin = process?.env?.PP_SECURE_LOGIN
const secretKey = process?.env?.PP_SECRET_KEY

function objectToQueryString(obj) {
  const params = new URLSearchParams()

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      params.append(key, obj[key])
    }
  }

  return params.toString()
}

function getHash(obj) {
  // 取得物件的所有鍵並按字母順序排序
  const sortedKeys = Object.keys(obj).sort()

  // 建立一個新的 URL 物件
  const url = new URL(apiUrl)

  // 遍歷排序後的鍵列表，將每個鍵值對設定為 URL 物件的 searchParams
  sortedKeys.forEach((key) => {
    const value = obj[key]
    url.searchParams.set(key, value)
  })

  // 使用 toString() 方法獲取完整的 URL 查詢字串
  const queryString = url.searchParams.toString()

  // 結合 secret key
  const stringToHash = `${queryString}${secretKey}`

  // 建立 MD5 加密器
  const md5Hash = crypto.createHash('md5')
  // 更新加密器的內容
  md5Hash.update(stringToHash)
  // 進行加密並取得加密後的十六進位字串
  const hash = md5Hash.digest('hex')

  return hash
}

module.exports = {
  getCasinoGames: async (ctx, next) => {
    // 要加密的原始字符串
    const originalString = `secureLogin=${secureLogin}`
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

  opengame: async (ctx, next) => {
    const query = ctx.request.query
    const params = {
      ...query,
      secureLogin,
      token: nanoid(),
    }
    const hash = getHash(params)
    const queryString = objectToQueryString({
      ...params,
      hash,
    })

    try {
      const getResult = await axios.post(
        `${apiUrl}/game/url?${queryString}`,
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
