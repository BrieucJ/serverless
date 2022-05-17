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
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions */

const handler = async () => {
  await source.initialize()
  logger.info('Datasource initialized')
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ event, context, express }: { event: any; context: any; express: any }): Promise<Context> => {
      const req = express.req as Request
      req.headers = event.headers
      context.req = req
      return await authContext(context as Context)
    },
    formatError: errorFormatter,
    formatResponse: responseFormatter,
  })
  logger.info('Apollo server initialized')
  return apolloServer.createHandler()
}

// main()
//   .then((server) => {
//     logger.info('Apollo server up')
//     const apolloServer = server
//   })
//   .catch((error: any) => {
//     logger.error('ERROR', { error })
//   })

exports.handler = handler
