module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/pp/getCasinoGames',
      handler: 'pp-gp.getCasinoGames',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/pp/opengame',
      handler: 'pp-gp.opengame',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
