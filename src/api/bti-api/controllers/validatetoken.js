'use strict'

/**
 * A set of functions called "actions" for `bti-api`
 */

module.exports = {
  // TODO
  validatetoken: async (ctx, next) => {
    ctx.type = 'text/plain'
    var userInfo

    try {
      // 取的 query string 的 auth_token
      const { auth_token } = ctx.request.query

      if (auth_token == undefined) {
        ctx.body = formatAsKeyValueText({
          error_code: '-3',
          error_message: 'TokenNotValid',
        })
        return
      }

      //get user info by token
      const token = auth_token
      const userInfoArray = await strapi.entityService.findMany(
        'api::bti-token-info.bti-token-info',
        {
          filters: {
            token,
          },
          populate: ['user_id'],
          sort: { createdAt: 'desc' },
        }
      )

      userInfo = userInfoArray[0]

      if (userInfo == undefined) {
        ctx.body = formatAsKeyValueText({
          error_code: '-3',
          error_message: 'TokenNotValid',
        })
        return
      }

      //get balance by user id
      const userBalanceArray = await strapi
        .service('api::wallet-api.wallet-api')
        .get({ user_id: userInfo.user_id.id })

      const userBalance = userBalanceArray[0]

      if (userBalance == undefined) {
        ctx.body = formatAsKeyValueText({
          error_code: '-3',
          error_message: 'TokenNotValid',
        })
        return
      }
      const cust_id = userInfo?.user_id?.id
      const cust_login = userInfo?.user_id?.username
      const city = 'KR'
      const country = 'KR'
      const currency_code = userInfo?.currency
      const language = 'ko'

      /**
       * EXAMPLE
       * error_code=0
       * error_message=OK
       * cust_id=bti_derek_cn
       * cust_login=bti_derek_cn
       * city=city
       * country=CN
       * currency_code=CNY
       * balance=53549.2690
       * extSessionID=bti_derek_cn-104.199.162.249-20231111073055
       * data=<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><status_code>00</status_code><member_id>testubc</member_id><member_name>testubc</member_name><city>city</city><country>CN</country><currency>uBC</currency><language>zh</language><Sport MinBet="0.01" MaxBet="999999999"><Branch ID="2" MinBet="200.00" MaxBet="2000.00" MaxBetPerMatch="10.00"/></Sport></s:Envelope>
       */

      ctx.body = formatAsKeyValueText({
        error_code: '0',
        error_message: 'No Error',
        cust_id,
        balance: parseFloat(userBalance.amount),
        cust_login,
        city,
        country,
        currency_code,
        data: `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><status_code>00</status_code><member_id>${cust_id}</member_id><member_name>${cust_login}</member_name><city>${city}</city><country>${country}</country><currency>${currency_code}</currency><language>${language}</language><Sport MinBet="5000" MaxBet="999999999"><Branch ID="2" MinBet="5000" MaxBet="999999999" MaxBetPerMatch="10.00"/></Sport></s:Envelope>`,
      })
    } catch (err) {
      ctx.body = formatAsKeyValueText({
        error_code: '-1',
        error_message: 'GeneralError',
        err: err,
      })
      return
    }
  },
}

function formatAsKeyValueText(data) {
  let plainText = ''
  let isFirstLine = true

  for (const key in data) {
    if (!isFirstLine) {
      plainText += '\n' // Add newline if it's not the first line
    }
    plainText += `${key}=${data[key]}`
    isFirstLine = false
  }
  return plainText
}
