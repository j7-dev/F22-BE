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
  ],
}
