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
  ],
}
