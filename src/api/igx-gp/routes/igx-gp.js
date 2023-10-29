module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/igx/login-11a',
      handler: 'igx-gp.login11a',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/igx/login-11b',
      handler: 'igx-gp.login11b',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
