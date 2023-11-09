module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/tokenapi/opengame',
      handler: 'token-gp.opengame',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/tokenapi/startgame',
      handler: 'token-gp.startgame',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
