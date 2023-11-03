module.exports = {
  type: 'content-api',
  routes: [
    // betting-records
    {
      method: 'GET',
      path: '/betting-records',
      handler: 'bettingRecords.get',
      config: {
        policies: [],
      },
    },
    // dp-wd
    {
      method: 'GET',
      path: '/dp-wd/dp',
      handler: 'dpWd.getDeposit',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/dp-wd/wd',
      handler: 'dpWd.getWithdraw',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/dp-wd/user-info',
      handler: 'dpWd.getDpWdInfosByUser',
      config: {
        policies: [],
      },
    },
    // betting-amount
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
    // statistic
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
    {
      method: 'GET',
      path: '/statistic/daily',
      handler: 'statistic.daily',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/statistic/today',
      handler: 'statistic.today',
      config: {
        policies: [],
      },
    },
    // helper
    {
      method: 'POST',
      path: '/helper/update-all-user-payments-gp',
      handler: 'helper.updateAllUserPaymentsGP',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/helper/update-all-user-uuid',
      handler: 'helper.updateAllUserUUID',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/helper/update-all-user-vip',
      handler: 'helper.updateAllUserVip',
      config: {
        policies: [],
      },
    },
  ],
}
