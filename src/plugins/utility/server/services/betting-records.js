// @ts-nocheck
'use strict'
const { nanoid } = require('nanoid')
const { removeUndefinedKeys } = require('./utils')
const dayjs = require('dayjs')

/**
 * @param args
 * @param args.gameProviderName: string - 遊戲商名稱 EVO, PP
 * @param args.user_id?: string
 * @param args.startTime?: Date ISO String
 * @param args.endTime?: Date ISO String
 * @returns sql: string - SQL 查詢語句
 */
function getSQLbyGameProviderName(args) {
  const {
    gameProviderName,
    user_id,
    startTime,
    endTime = dayjs().add(8, 'hour').toISOString(),
  } = args

  const gp = gameProviderName.toLowerCase()
  const whereCondition = ['user_id', 'startTime'].filter((key) => !!args?.[key])
  const whereSQL = whereCondition
    .map((key) => {
      if (key === 'user_id') {
        return `${gp}_links.user_id = ${user_id}`
      }
      if (key === 'startTime') {
        return `${gp}.updated_at BETWEEN '${startTime}' AND '${endTime}'`
      }
    })
    .join(' AND ')

  const sql = `SELECT ${gp}.id, ${gp}.updated_at, ${gp}_links.user_id, '${gameProviderName}' AS game_provider
FROM ${gp}_transactions AS ${gp}
LEFT JOIN ${gp}_transactions_user_id_links AS ${gp}_links ON ${gp}.id = ${gp}_links.${gp}_transaction_id
${!!whereCondition.length ? `WHERE ${whereSQL}` : ' '}
`
  return sql
}

module.exports = ({ strapi }) => ({
  /**
   * 取得各家 game provider 的交易紀錄
   * @param object args
   * @param args.gameProviderNames?: string  - 遊戲商名稱 EVO, PP 不指定就是全部
   * @param args.user_id?: string
   * @param args.pageSize?: number - 一頁幾筆
   * @param args.startTime?: Date ISO String
   * @param args.endTime?: Date ISO String
   * @returns Txn[] - 交易紀錄
   */
  async get(args) {
    // ⚠️ 如果 support_game_providers 沒有 ${gp}_transactions 這張TABLE時會報錯
    // const support_game_providers =
    // TODO  ⚠️ global.appData?.siteSetting?.support_game_providers
    const support_game_providers = ['EVO', 'PP']
    const gameProviderNames = args?.gameProviderNames
      ? [args?.gameProviderNames]
      : support_game_providers
    const txns = await strapi
      .service('plugin::utility.bettingRecords')
      .getTxns({
        ...args,
        gameProviderNames,
      })

    return txns
  },

  /**
   * 取得各家 game provider 的交易紀錄
   * @param object args
   * @param args.gameProviderNames?: string[] - 遊戲商名稱 EVO, PP
   * @param args.user_id?: string
   * @param args.pageSize?: number  - 一頁幾筆
   * @param args.startTime?: Date ISO String
   * @param args.endTime?: Date ISO String
   * @returns Txn[] - 交易紀錄
   */
  async getTxns(args) {
    const default_currency = global.appData?.siteSetting?.default_currency
    const default_amount_type = global.appData?.siteSetting?.default_amount_type
    const { user_id, pageSize = 10, gameProviderNames, ...rest } = args

    if (!gameProviderNames.length) {
      throw new Error('gameProviderNames length is 0')
    }

    // TODO 要支持分頁查詢, 日期查詢, 以及排序

    const gamesSQL = gameProviderNames
      .map((gameProviderName) => {
        return getSQLbyGameProviderName({
          ...rest,
          gameProviderName,
          user_id,
        })
      })
      .join(' UNION ALL ')

    const SQLquery = `${gamesSQL}
ORDER BY updated_at DESC
LIMIT ${pageSize};`

    const queryResult = await strapi.db.connection.raw(SQLquery)

    const RowDataPackets = queryResult?.[0] || []

    const allTxns = await Promise.all(
      gameProviderNames.map(async (gameProviderName) => {
        const resource = global.appData?.gameProvider?.[gameProviderName]?.txn
        if (!resource) return

        const ids = RowDataPackets.filter(
          (data) => data?.game_provider === gameProviderName
        ).map((data) => data.id)

        if (!ids.length) return

        const config = removeUndefinedKeys({
          filters: {
            user_id,
            id: {
              $in: ids,
            },
          },
        })

        const txns = await strapi.entityService.findMany(resource, config)

        const formatRecords = txns.map((txn) => {
          return {
            uuid: nanoid(),
            status: txn?.transaction_type, //TODO  未來可以統一MAPPING
            game_provider: gameProviderName,
            createdAt: txn.createdAt,
            updatedAt: txn.updatedAt,
            currency: txn?.currency || default_currency,
            amount_type: txn?.amount_type || default_amount_type,
            amount: txn?.amount, // NOTE 須注意是不是每家的 txn 都有這個
            transaction_ref_id: txn?.transaction_ref_id, // 一樣則為同一局
            // actual_stake: txn?.amount,
            // winloss: txn?.amount, // FIXME 只是先
            game_provider_transaction_id: txn.id,
            user_id,
          }
        })

        return formatRecords
      })
    )

    const filteredTxns = allTxns.flat().filter((txn) => !!txn)
    console.log('⭐  filteredTxns:', filteredTxns)

    return filteredTxns
  },
})
