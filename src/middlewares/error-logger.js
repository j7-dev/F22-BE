const winston = require('winston')
require('winston-daily-rotate-file')
const path = require('path')

const addTimestamp = winston.format((info, opts) => {
  const newInfo = opts.timestamp
    ? {
        timestamp: new Date().toISOString(),
        ...info,
      }
    : info

  return newInfo
})

const logger = winston.createLogger({
  // 當 transport 不指定 level 時 , 使用 info 等級
  level: 'info',
  // 設定輸出格式
  // format: winston.format.json(),
  format: winston.format.combine(
    addTimestamp({ timestamp: true }), // 使用自定义格式化器添加时间戳
    winston.format.json() // 保留原有的 JSON 格式
  ),
  // 設定此 logger 的日誌輸出器
  transports: [
    // 只有 error 等級的錯誤 , 才會將訊息寫到 error.log 檔案中
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: path.join(__dirname, '../..', 'logs', `error-%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // info or 以上的等級的訊息 , 將訊息寫入 combined.log 檔案中
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../..', 'logs', `combined-%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
})

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // 让请求继续处理
      await next()
    } catch (error) {
      // 如果发生错误，使用 logger.error 记录错误消息
      const errorLog = {
        code: ctx?.response?.status,
        message: error || error?.message || ctx?.response?.message,
        bodyPayload: ctx?.request?.body,
        urlParams: ctx?.request?.query,
        url: `[${ctx?.request?.method}] ${ctx?.request?.url}`,
        header: ctx?.request?.headers,
      }
      logger.error('API Error:', errorLog)

      // 将错误消息发送给客户端
      ctx.status = error.status || 500
      ctx.body = {
        error: error?.message || 'Internal Server Error22',
      }
    }
  }
}
