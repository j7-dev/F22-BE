'use strict'

module.exports = ({ strapi }) => ({
  async get(args) {
    const support_game_providers =
      global.appData?.siteSetting?.support_game_providers
    const gameProviderName = args?.gameProviderName
    const txns = await strapi
      .service('plugin::utility.bettingRecords')
      .getTxns({
        ...args,
        gameProviderNames: gameProviderName
          ? [gameProviderName]
          : support_game_providers,
      })

    return txns
  },
  async getTxns(args) {
    const defaultCurrency = global.appData?.siteSetting?.default_currency
    const defaultAmountType = global.appData?.siteSetting?.default_amount_type
    const user_id = args?.user_id
    const gameProviderNames = args?.gameProviderNames || []

    if (!gameProviderNames.length) {
      throw new Error('gameProviderNames length is 0')
    }

    // TODO 要支持分頁查詢
    // TODO 改成 gameProviderNames map 生成

    const queryResult = await strapi.db.connection.raw(`
				SELECT evo.id, evo.updated_at, evo_links.user_id, 'EVO'  AS game_provider
				FROM evo_transactions AS evo
				LEFT JOIN evo_transactions_user_id_links AS evo_links ON evo.id = evo_links.evo_transaction_id
				${user_id ? `WHERE evo_links.user_id = ${user_id}` : ''}
				UNION ALL
				SELECT pp.id, pp.updated_at, pp_links.user_id, 'PP' AS game_provider
				FROM pp_transactions AS pp
				LEFT JOIN pp_transactions_user_id_links AS pp_links ON pp.id = pp_links.pp_transaction_id
				${user_id ? `WHERE pp_links.user_id = ${user_id}` : ''}
		ORDER BY updated_at DESC
		LIMIT 10;`)

    const RowDataPackets = queryResult?.[0] || []

    const allTxns = await Promise.all(
      gameProviderNames.map(async (gameProviderName) => {
        const resource = global.appData?.gameProvider?.[gameProviderName]?.txn
        if (!resource) return

        const ids = RowDataPackets.filter(
          (data) => data?.game_provider === gameProviderName
        ).map((data) => data.id)

        const config = user_id
          ? {
              filters: {
                user_id,
                id: {
                  $in: ids,
                },
              },
            }
          : {}

        const txns = await strapi.entityService.findMany(resource, config)

        const formatRecords = txns.map((txn) => {
          return {
            status: txn?.transaction_type, //TODO  未來可以統一MAPPING
            game_provider: gameProviderName,
            createdAt: txn.createdAt,
            updatedAt: txn.updatedAt,
            currency: txn?.currency || defaultCurrency,
            amount_type: txn?.amount_type || defaultAmountType,
            stake: txn?.amount, // NOTE 須注意是不是每家的 txn 都有這個
            actual_stake: txn?.amount,
            winloss: txn?.amount, // FIXME 只是先
            game_provider_transaction_id: txn.id,
            is_finish: txn?.is_finish, //TODO 未來可以統一MAPPING後再改
          }
        })

        return formatRecords
      })
    )

    const filteredTxns = allTxns.flat().filter((txn) => !!txn)

    return filteredTxns
  },
})
