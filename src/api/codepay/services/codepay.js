'use strict'

/**
 * codepay service
 */
const axios = require('axios').default
const { nanoid } = require('nanoid')
const dayjs = require('dayjs')

const apiUrl = process?.env?.CODEPAY_API_URL
const groupVisibleId = process?.env?.CODEPAY_GROUP_VISIBLE_ID
const apikey = process?.env?.CODEPAY_API_KEY
const simpleAddressTo = process?.env?.CODEPAY_SIMPLE_ADDRESS_TO

let newToken = null

module.exports = () => ({
  async newtoken() {
    const newTokenResult = await axios.post(`${apiUrl}/v1.0.0/newtoken`, {
      groupVisibleId,
      apikey,
    })
    return newTokenResult
  },
  async reissuetoken() {
    const reissuetokenResult = await axios.post(
      `${apiUrl}/v1.0.0/reissuetoken`,
      null,
      {
        headers: {
          RefreshToken: newToken?.refresh_token,
        },
      }
    )
    return reissuetokenResult
  },
  async newsend(body) {
    // 取得 token
    if (!newToken) {
      const newTokenResult = await strapi
        .service('api::codepay.codepay')
        .newtoken()

      const status_code = newTokenResult?.data?.detail?.status_code
      newToken =
        status_code === 200
          ? {
              access_token: newTokenResult?.data?.detail?.access_token,
              refresh_token: newTokenResult?.data?.detail?.refresh_token,
              exp: newTokenResult?.data?.detail?.exp,
            }
          : null
    }

    // 如果 token 過期就重新取得
    const currentTimestamp = dayjs().unix()
    if (currentTimestamp > newToken?.exp) {
      const reissuetokenResult = await strapi
        .service('api::codepay.codepay')
        .reissuetoken()
      const status_code = reissuetokenResult?.data?.detail?.status_code
      newToken =
        status_code === 200
          ? {
              access_token: reissuetokenResult?.data?.detail?.access_token,
              refresh_token: reissuetokenResult?.data?.detail?.refresh_token,
              exp: reissuetokenResult?.data?.detail?.exp,
            }
          : null
    }

    // 儲值
    const newsendResult = await axios.post(
      `${apiUrl}/v1.0.0/newsend`,
      {
        requestNo: nanoid(),
        simpleAddressFrom: body?.simpleAddressFrom,
        simpleAddressTo: simpleAddressTo,
        amount: body?.amount,
        sendPassword: body?.sendPassword,
        message: `smtbet7 deposit ${body?.amount} ${body?.currency}`,
        note: `smtbet7 deposit ${body?.amount} ${body?.currency}`,
      },
      {
        headers: {
          AccessToken: newToken?.access_token,
        },
      }
    )

    const msg = newsendResult?.data?.detail?.msg

    // ref: https://api.codepay.co.kr/codepay_redoc_v1.0.0
    if (msg.startsWith('succ')) {
      // 成功 add balance
      const addResult = await strapi.service('api::wallet-api.wallet-api').add({
        user_id: body?.user_id,
        amount: body?.amount,
        title: `smtbet7 deposit ${body?.amount} ${body?.currency}`,
        type: 'DEPOSIT',
        by: 'USER',
        currency: body?.currency,
        amount_type: body?.amount_type || 'CASH',
      })
      return {
        ...newsendResult,
        status: 200,
      }
    }
  },
})
