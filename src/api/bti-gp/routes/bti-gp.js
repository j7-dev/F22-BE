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
  ],
}
