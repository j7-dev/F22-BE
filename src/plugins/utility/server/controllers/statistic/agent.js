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
// TODO 分頁
module.exports = async (ctx) => {
  const query = ctx.request.query
  const start = query?.start
  const end = query?.end
  const pageSize = 100
  const currency = query?.currency || default_currency
  const amount_type = query?.amount_type || default_amount_type
  const UTC9toUTC0 = global.appData.UTC9toUTC0

  // 取得 agent Role id

  const agentRoleId = await strapi
    .service('plugin::utility.roles')
    .getRoleId('agent')

  if (!agentRoleId) {
    return ctx.badRequest(`cant find agent role id`)
  }

  // 1. 取得所有代理商
  const allAgents = await strapi.entityService.findMany(
    'plugin::users-permissions.user',
    {
      fields: ['id', 'username', 'commission_rate'],
      filters: {
        role: agentRoleId,
      },
      limit: pageSize,
    }
  )
  const result = await Promise.all(
    allAgents.map(async (agent) => {
      const agent_id = agent?.id

      const members = await strapi
        .service('plugin::utility.members')
        .getMembersByAgent({
          agent_id,
          fields: ['id'],
          start,
          end,
        })
      const member_ids = members.map((member) => member?.id)

      const getDepositSQL = getTxnSQL({
        type: 'DEPOSIT',
        user_ids: member_ids,
        start,
        end,
      })
      const getDpResult = member_ids.length
        ? await strapi.db.connection.raw(getDepositSQL)
        : null
      const totalDeposit = getDpResult?.[0]?.[0]?.total || 0

      const getWithdrawSQL = getTxnSQL({
        type: 'WITHDRAW',
        user_ids: member_ids,
        start,
        end,
      })
      const getWdResult = member_ids.length
        ? await strapi.db.connection.raw(getWithdrawSQL)
        : null
      const totalWithdraw = (getWdResult?.[0]?.[0]?.total || 0) * -1

      const getDebitSQL = getTxnSQL({
        type: 'DEBIT',
        user_ids: member_ids,
        start,
        end,
      })
      const getDebitResult = member_ids.length
        ? await strapi.db.connection.raw(getDebitSQL)
        : null
      const totalDebit = (getDebitResult?.[0]?.[0]?.total || 0) * -1

      const getCreditSQL = getTxnSQL({
        type: 'CREDIT',
        user_ids: member_ids,
        start,
        end,
      })
      const getCreditResult = member_ids.length
        ? await strapi.db.connection.raw(getCreditSQL)
        : null
      const totalCredit = getCreditResult?.[0]?.[0]?.total || 0

      const getCouponSQL = getTxnSQL({
        type: ["'COUPON'", "'MANUAL'", "'TURNOVER_BONUS_TO_CASH'"],
        user_ids: member_ids,
        start,
        end,
      })
      const getCouponResult = member_ids.length
        ? await strapi.db.connection.raw(getCouponSQL)
        : null
      const totalCoupon = getCouponResult?.[0]?.[0]?.total || 0

      const commissionRate = (agent?.commission_rate || 0) / 100
      const commission = Math.round(totalDebit * commissionRate)

      return {
        key: agent?.id,
        agent,
        deposit: totalDeposit,
        withdraw: totalWithdraw,
        dpWd: totalDeposit - totalWithdraw,
        betAmount: totalDebit,
        payout: totalCredit,
        winloss: totalDebit - totalCredit,
        coupon: totalCoupon,
        profit: totalDebit - totalCredit - totalCoupon,
        commissionRate,
        commission,
      }
    })
  )

  ctx.body = {
    status: '200',
    message: 'get statistic/agent success',
    data: result,
  }
}
