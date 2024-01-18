module.exports = {
  routes: [
    {
      method: 'GET',
      path: ' /wc/session-info',
      handler: 'get-session-info.main',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/wc/check-session-id',
      handler: 'get-session-info.check',
    },
    {
      method: 'POST',
      path: ' /wc/session-info',
      handler: 'wc.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
