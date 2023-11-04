module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/site-notify',
      handler: 'cms-post.getSiteNotify',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
