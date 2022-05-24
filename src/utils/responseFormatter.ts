import { UserInputError } from 'apollo-server-express'
// import { ValidationError } from 'apollo-server-express'
import { GraphQLResponse } from 'apollo-server-types'
import { GraphQLFormattedError } from 'graphql'
import { MongooseError } from 'mongoose'

export default (response: GraphQLResponse): GraphQLResponse => {
  if (response.errors) {
    response.data = null
    response.errors = response.errors.reduce((acc: GraphQLFormattedError[], error: GraphQLFormattedError): GraphQLFormattedError[] => {
      if (error.extensions && error.extensions.code === 'BAD_USER_INPUT') {
        if (!error.extensions?.errors) {
          return [error]
        }
        error = error as UserInputError
        const locations = error.locations
        const path = error.path
        const code = error.extensions?.code as string
        const extensionsErrors = error.extensions?.errors as MongooseError[]
        const errorKeys = Object.keys(extensionsErrors) as Array<keyof typeof extensionsErrors>
        const errors = errorKeys.reduce((acc2: GraphQLFormattedError[], key): GraphQLFormattedError[] => {
          acc2.push({
            message: (extensionsErrors[key] as Error).message,
            locations,
            path,
            extensions: {
              code: code,
            },
          })
          return acc2
        }, [])
        acc = acc.concat(errors)
      } else {
        acc.push(error)
      }
      return acc
    }, [])
  }
  return response
}
