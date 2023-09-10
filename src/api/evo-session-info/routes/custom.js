module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/evo/session-info',
      handler: 'get-session-info.main',
    },
    {
      method: 'GET',
      path: '/evo/check-session-id',
      handler: 'get-session-info.check',
    },
    {
      method: 'POST',
      path: '/evo/session-info',
      handler: 'evo-session-info.create',
    },
  ],
}
