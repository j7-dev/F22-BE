module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/bti/opengame',
      handler: 'bti-gp.opengame',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/bti/token-info',
      handler: 'bti-gp.tokenInfo',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
