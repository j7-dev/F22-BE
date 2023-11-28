'use strict'
/**
 * A set of functions called "actions" for `pp-gp`
 */
const axios = require('axios').default
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

  // 不要使用 new URL toString() URL轉百分比會出錯
  const queryString = sortedKeys.map((key) => `${key}=${obj[key]}`).join(`&`)

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

    const getResult = await axios.post(
      `${apiUrl}/getCasinoGames?${queryString}`,
      null,
      {
        family: 4,
      }
    )

    ctx.body = getResult?.data
  },

  opengame: async (ctx, next) => {
    const query = ctx.request.query
    const user_id = query?.user_id || 1
    const USERNAME_PREFIX = process?.env?.USERNAME_PREFIX
    if (!user_id) throw new Error("can't get user_id")

    const siteSetting = global.appData.siteSetting
    const defaultCurrency = siteSetting?.default_currency

    const currency = (query?.currency || '')?.toUpperCase() || defaultCurrency

    const token = `${USERNAME_PREFIX}_${nanoid()}`
    const params = {
      ...query,
      secureLogin,
      token,
      lobbyUrl: 'https://smtbet7.com/slot',
    }
    const hash = getHash(params)
    const queryString = objectToQueryString({
      ...params,
      hash,
    })

    const getResult = await axios.post(
      `${apiUrl}/game/url?${queryString}`,
      null,
      {
        family: 4,
      }
    )

    // save token to pp-token-info
    const createPpTokenInfoResult = await strapi.entityService.create(
      'api::pp-token-info.pp-token-info',
      {
        data: {
          token,
          user_id: user_id,
          currency,
        },
      }
    )

    ctx.body = getResult?.data
  },
}
