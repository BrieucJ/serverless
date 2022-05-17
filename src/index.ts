import 'reflect-metadata'
import './utils/config.js'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { API_PATH } from './utils/config.js'
import logger from './utils/logger.js'
import source from './utils/source.js'
import resolvers from './resolvers/index.js'
import typeDefs from './typeDefs/index.js'
import { Context } from './utils/types.js'
import { authContext } from './utils/authentication.js'
import errorFormatter from './utils/errorFormatter.js'
import responseFormatter from './utils/responseFormatter.js'

await source.initialize()
logger.info('Datasource initialized')
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (context: Context) => {
    return await authContext(context)
  },
  formatError: errorFormatter,
  formatResponse: responseFormatter,
})

await server.start()

const app = express()
server.applyMiddleware({ app, path: API_PATH })
app.listen(process.env.PORT, () => {
  logger.info(`🚀 Server started on localhost:${process.env.PORT!}${API_PATH}`)
})
