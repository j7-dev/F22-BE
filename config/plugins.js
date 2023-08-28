module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "strapi-provider-email-smtp",
      providerOptions: {
        host: "smtpout.secureserver.net", //SMTP Host
        port: 465, //SMTP Port
        secure: true,
        username: "service@yc-tech.co",
        password: "X0921565659x+",
        rejectUnauthorized: true,
        requireTLS: true,
        connectionTimeout: 1,
      },
    },
    settings: {
      defaultFrom: "service@yc-tech.co",
      defaultReplyTo: "service@yc-tech.co",
    },
  },
  "my-plugin": {
    enabled: true,
    resolve: "./src/plugins/my-plugin",
  },
});
