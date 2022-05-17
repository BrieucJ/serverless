import { createLogger, format, transports } from 'winston'
const { combine, errors, timestamp } = format

const baseFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  format((info) => {
    info.level = info.level.toUpperCase()
    return info
  })(),
)

const flatFormat = combine(baseFormat, format.json())
// const prettyFormat = combine(baseFormat, format.prettyPrint());

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  silent: process.env.NODE_ENV === 'test',
  format: flatFormat,
  defaultMeta: {
    service: 'api',
    timestamp: new Date(),
  },
  transports: [new transports.Console()],
  // transports: [
  //   new transports.Console({ format: winston.format.cli() }),
  //   // new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
  //   // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  //   // new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
  //   // new winston.transports.File({ filename: 'logs/combined.log' }),
  // ],
})

export default logger
