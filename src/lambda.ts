import { ApolloServer } from 'apollo-server-lambda'
import source from './utils/source'
import resolvers from './resolvers'
import typeDefs from './typeDefs'
import errorFormatter from './utils/errorFormatter'
import responseFormatter from './utils/responseFormatter'
import { authContext } from './utils/authentication'
import logger from './utils/logger'

logger.info('LAMBDA INITIALIZED')
;(async () => {
  await source.initialize()
  logger.info('Datasource initialized')
})()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ event, context, express }) => {
    let req = express.req
    req.headers = event.headers
    context.req = req
    return {
      event,
      context: await authContext(context),
    }
  },
  formatError: errorFormatter,
  formatResponse: responseFormatter,
})

exports.handler = server.createHandler()
