module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/evo/tablelist',
      handler: 'evo-gp.tablelist',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/evo/opengame',
      handler: 'evo-gp.opengame',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
