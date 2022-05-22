import { UserInputError } from 'apollo-server-express'
import { GraphQLResponse } from 'apollo-server-types'
import { GraphQLFormattedError } from 'graphql'

export default (response: any): GraphQLResponse => {
  if (response.errors) {
    response.data = null
    response.errors = response.errors.reduce((acc: GraphQLFormattedError[], error: GraphQLFormattedError): GraphQLFormattedError[] => {
      if (error.message === 'BAD_USER_INPUT') {
        error = error as UserInputError
        // const locations = error.locations
        const path = error.path
        const code = error.extensions?.code as string
        const extensionsErrors = error.extensions?.errors
        const errors = Object.keys(extensionsErrors).reduce((acc2: GraphQLFormattedError[], key: string): GraphQLFormattedError[] => {
          acc2.push({
            message: extensionsErrors[key].message,
            // locations,
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
