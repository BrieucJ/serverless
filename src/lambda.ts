import { ApolloServer } from 'apollo-server-lambda'
import source from './utils/source.js'
import resolvers from './resolvers/index.js'
import typeDefs from './typeDefs/index.js'
import errorFormatter from './utils/errorFormatter.js'
import responseFormatter from './utils/responseFormatter.js'
import { authContext } from './utils/authentication.js'
import logger from './utils/logger.js'
import { Request } from 'express'
import { Context } from './utils/types'

logger.info('Lambda started')
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions */
let start: any = new Date()
await source.initialize()
let end: any = new Date()
logger.info(`Source initialized ${end - start}`)
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
logger.info('Apollo server started')

export const handler = apolloServer.createHandler()
