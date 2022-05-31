import './config.js'
import { API_PATH } from './config.js'
import resolvers from '../resolvers/index.js'
import typeDefs from '../typeDefs/index.js'
import responseFormatter from './responseFormatter.js'
import errorFormatter from './errorFormatter.js'
import { authContext } from './authentication.js'
import { ExecuteArguments } from './types.js'
import { ApolloServer } from 'apollo-server-express'
import fetch from 'cross-fetch'
import { HttpLink } from 'apollo-link-http'
import { execute, toPromise } from 'apollo-link'
import express from 'express'

export const initTestServer = async () => {
  const app = express()
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatResponse: responseFormatter,
    formatError: errorFormatter,
    context: async (context) => {
      return await authContext(context)
    },
  })
  await server.start()
  server.applyMiddleware({ app, path: API_PATH })
  const httpServer = app.listen(process.env.PORT!)

  const link = new HttpLink({
    fetch,
    uri: `http://localhost:${process.env.PORT!}${API_PATH}`,
  })

  const executeOperation = async ({ query, variables = {}, context }: ExecuteArguments) => {
    return await toPromise(execute(link, { query, variables, context }))
  }

  const testServer = {
    stop: () => httpServer.close(),
    execute: executeOperation,
  }
  return testServer
}
