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

exports.handler = async () => {
  await source.initialize()
  logger.info('Datasource initialized')
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ event, context, express }: { event: any; context: any; express: any }): Promise<Context> => {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions */
      // logger.info(`event ${event}`)
      // logger.info(`context ${context}`)
      // logger.info(`express ${express}`)
      const req = express.req as Request
      req.headers = event.headers
      context.req = req
      return await authContext(context as Context)
    },
    formatError: errorFormatter,
    formatResponse: responseFormatter,
  })
  logger.info('ApolloServer initialized')
  return apolloServer.createHandler()
}

// let server

// main()
//   .then((apolloServer) => {
//     exports.handler = apolloServer.createHandler()
//     logger.info('Server up')
//   })
//   .catch((error: any) => {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     logger.error('ERROR initializing Datasource', { error })
//   })

// exports.handler = server
