import { ApolloServer } from 'apollo-server-lambda'
import source from './utils/source'
import resolvers from './resolvers'
import typeDefs from './typeDefs'
import errorFormatter from './utils/errorFormatter'
import responseFormatter from './utils/responseFormatter'
import { authContext } from './utils/authentication'
import logger from './utils/logger'
import { Request } from 'express'
import { Context } from './utils/types'

logger.info('Lambda started')
;(async () => {
  await source.initialize()
})()
  .then(() => {
    logger.info('Datasource initialized')
  })
  .catch((error: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.error('ERROR initializing Datasource', { error })
  })

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (event: any, context: any, express: any): Promise<Context> => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const req = express.req as Request
    req.headers = event.headers
    context.req = req
    return await authContext(context as Context)
  },
  formatError: errorFormatter,
  formatResponse: responseFormatter,
})

exports.handler = server.createHandler()
