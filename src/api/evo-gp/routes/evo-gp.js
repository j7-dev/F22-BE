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
  ],
}
