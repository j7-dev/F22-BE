'use strict'
const default_currency = 'KRW'
const default_amount_type = 'CASH'

function getTxnSQL({
  type,
  status = 'SUCCESS',
  currency = 'KRW',
  amount_type = 'CASH',
  user_ids = [],
  start = undefined,
  end = undefined,
}) {
  const user_ids_string = user_ids.join(', ')
  const sqlString = `
	SELECT SUM(tr.amount) AS total
FROM transaction_records tr
JOIN transaction_records_user_links trul ON tr.id = trul.transaction_record_id
WHERE tr.status = '${status}'
${
  typeof type === 'string'
    ? `AND tr.type = '${type}'`
    : `AND tr.type IN (${type.join(', ')})`
}
AND tr.currency = '${currency}'
AND tr.amount_type = '${amount_type}'
${user_ids.length ? `AND trul.user_id IN (${user_ids_string})` : ''}
${start ? `AND tr.created_at >= '${start}'` : ''}
${end ? `AND tr.created_at <= '${end}'` : ''};`

  return sqlString
}

function getBalanceSQL({
  currency = 'KRW',
  amount_type = 'CASH',
  user_ids = [],
  start = undefined,
  end = undefined,
}) {
  const user_ids_string = user_ids.join(', ')
  const sqlString = `
	SELECT SUM(bl.amount) AS total
FROM balances bl
JOIN balances_user_links blul ON bl.id = blul.balance_id
WHERE bl.currency = '${currency}'
AND bl.amount_type = '${amount_type}'
${user_ids.length ? `AND blul.user_id IN (${user_ids_string})` : ''}
${start ? `AND bl.created_at >= '${start}'` : ''}
${end ? `AND bl.created_at <= '${end}'` : ''};`

  return sqlString
}
// TODO 分頁
/**
 * 找出此用戶底下所有 推薦用戶的數據
 */
module.exports = async (ctx) => {
  const query = ctx.request.query
  const start = query?.start
  const end = query?.end
  const pageSize = 100
  const currency = query?.currency || default_currency
  const user_id = query?.user_id
  const amount_type = query?.amount_type || default_amount_type
  const UTC9toUTC0 = global.appData.UTC9toUTC0

  if (!user_id) {
    return ctx.badRequest(`cant find user id`)
  }

  // 1. 取得所有推薦用戶
  const allReferrals = await strapi.entityService.findMany(
    'plugin::users-permissions.user',
    {
      fields: ['id', 'username', 'created_at'],
      filters: {
        referrer: user_id,
      },
      limit: pageSize,
    }
  )
  const result = await Promise.all(
    allReferrals.map(async (referral) => {
      const referral_id = referral?.id

      const deposit = await strapi
        .service('plugin::utility.bettingAmount')
        .get({
          type: ['DEPOSIT'],
          currency,
          amount_type,
          start,
          end,
          user_id: referral_id,
        })

      const withdraw =
        (await strapi.service('plugin::utility.bettingAmount').get({
          type: ['WITHDRAW'],
          currency,
          amount_type,
          start,
          end,
          user_id: referral_id,
        })) * -1

      const betAmount =
        (await strapi.service('plugin::utility.bettingAmount').get({
          type: ['DEBIT'],
          currency,
          amount_type,
          start,
          end,
          user_id: referral_id,
        })) * -1

      const payout =
        (await strapi.service('plugin::utility.bettingAmount').get({
          type: ['CREDIT'],
          currency,
          amount_type,
          start,
          end,
          user_id: referral_id,
        })) * -1

      const coupon = await strapi.service('plugin::utility.bettingAmount').get({
        type: ['COUPON', 'MANUAL', 'TURNOVER_BONUS_TO_CASH'],
        currency,
        amount_type,
        start,
        end,
        user_id: referral_id,
      })

      const latestBet = await strapi.entityService.findMany(
        'api::transaction-record.transaction-record',
        {
          fields: '*',
          filters: {
            user: referral_id,
            type: 'DEBIT',
            status: 'SUCCESS',
          },
          sort: { createdAt: 'desc' },
          limit: 1,
        }
      )

      return {
        key: referral?.id,
        referral,
        deposit,
        withdraw,
        dpWd: deposit - withdraw,
        betAmount,
        payout,
        winloss: betAmount - payout,
        coupon,
        profit: betAmount - payout - coupon,
        latestBetAt: latestBet.length ? latestBet[0]?.createdAt : null,
      }
    })
  )

  ctx.body = {
    status: '200',
    message: 'get statistic/by-referral success',
    data: result,
  }
}
