const pino = require('pino')
const logger = pino({
  prettyPrint: {
    colorize: true,
    ignore: 'hostname,pid',
  },
})

const info = (logMessage) => {
  logger.info(logMessage)
}

const debug = (logMessage) => {
  logger.debug(logMessage)
}

const warn = (logMessage) => {
  logger.warn(logMessage)
}

const error = (logMessage) => {
  logger.error(logMessage)
}

module.exports = {
  info,
  debug,
  warn,
  error,
}
