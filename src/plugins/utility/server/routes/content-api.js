module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/betting-amount/win',
      handler: 'bettingAmount.getWin',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/betting-amount/loss',
      handler: 'bettingAmount.getLoss',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/betting-amount/win-loss-ratio',
      handler: 'bettingAmount.getWinLossRatio',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/statistic/recent',
      handler: 'statistic.recent',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/statistic/important',
      handler: 'statistic.important',
      config: {
        policies: [],
      },
    },
  ],
}