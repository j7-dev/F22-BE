'use strict'
const gpEnum = require('./enum')
const default_currency = 'KRW'
const default_amount_type = 'CASH'

// TODO 分頁
/**
 * 找出此用戶底下所有 推薦用戶的數據
 */
module.exports = async (ctx) => {
  const query = ctx.request.query
  const start = query?.filters?.createdAt?.$gt
  const end = query?.filters?.createdAt?.$lt
  const pagination = query?.pagination
  const pageSize = pagination?.pageSize || 20
  const page = pagination?.page || 1
  const currency = query?.currency || default_currency
  const username = query?.filters?.username?.$containsi
  const amount_type = query?.amount_type || default_amount_type
  const UTC9toUTC0 = global.appData.UTC9toUTC0
  const siteSetting = global.appData.siteSetting
  const support_game_providers = siteSetting?.support_game_providers || []

  // 1. 取得用戶
  const filters = username
    ? {
        username: {
          $contains: username,
        },
      }
    : undefined

  const allUsers = await strapi.entityService.findMany(
    'plugin::users-permissions.user',
    {
      fields: ['id', 'username', 'created_at'],
      filters,
      limit: pageSize,
      start: pageSize * (page - 1),
    }
  )

  const [_, total] = await strapi.db
    .query('plugin::users-permissions.user')
    .findWithCount({
      select: ['id'],
      where: filters,
      orderBy: { createdAt: 'DESC' },
    })

  const result = await Promise.all(
    allUsers.map(async (user) => {
      const user_id = user?.id

      const dataResult = await Promise.all(
        ['ALL', ...support_game_providers].map(async (gp) => {
          const by = gp === 'ALL' ? undefined : gpEnum[gp]
          const debit = await strapi
            .service('plugin::utility.bettingAmount')
            .get({
              type: ['DEBIT'],
              by,
              currency,
              amount_type,
              start,
              end,
              user_id,
            })

          const credit =
            (await strapi.service('plugin::utility.bettingAmount').get({
              type: ['CREDIT'],
              by,
              currency,
              amount_type,
              start,
              end,
              user_id,
            })) * -1

          const winLoss = debit - credit

          return {
            game_provider: gp,
            debit: debit,
            credit: credit,
            winLoss: winLoss,
          }
        })
      )

      return {
        data: {
          user_id: user_id,
          user,
          data: dataResult,
        },
      }
    })
  )

  ctx.body = {
    status: '200',
    message: 'get member betting records success',
    data: result,
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        total,
      },
    },
  }
}
