module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': [
            'self',
            '*.smtbet7.com',
            '*.vercel.app',
            'f22-fe.vercel.app',
          ],
          'connect-src': [
            "'self'",
            'https:',
            '*.smtbet7.com',
            '*.vercel.app',
            'f22-fe.vercel.app',
          ],
          'frame-ancestors': [
            "'self'",
            '*.smtbet7.com',
            '*.vercel.app',
            'f22-fe.vercel.app',
          ],
        },
      },
    },
  },
  'strapi::cors',
  // {
  //   name: 'strapi::cors',
  //   config: {
  //     enabled: false,
  //     header: '*',
  //     origin: [
  //       'be-dev.smtbet7.com',
  //       'smtbet7.com',
  //       'www.w3schools.com',
  //       '*.vercel.app',
  //       'f22-fe.vercel.app',
  //     ],
  //   },
  // },
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'global::error-logger',
]
