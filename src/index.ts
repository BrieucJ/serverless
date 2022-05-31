import './utils/config.js'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { API_PATH } from './utils/config.js'
import { connect } from './utils/db.js'
import logger from './utils/logger.js'
import resolvers from './resolvers/index.js'
import typeDefs from './typeDefs/index.js'
import { Context } from './utils/types.js'
import { authContext } from './utils/authentication.js'
import responseFormatter from './utils/responseFormatter.js'
import errorFormatter from './utils/errorFormatter.js'

await connect()

logger.info('Connected to DB')
// 'http://localhost:3000', 'https://studio.apollographql.com'
const corsOptions = {
  origin: ['*'],
  credentials: true,
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (context: Context) => {
    return await authContext(context)
  },
  formatResponse: responseFormatter,
  formatError: errorFormatter,
  csrfPrevention: true,
})

await server.start()
const app = express()
server.applyMiddleware({ app, path: API_PATH, cors: corsOptions })
app.listen(process.env.PORT, () => {
  logger.info(`🚀 Server started on localhost:${process.env.PORT!}${API_PATH}`)
})
