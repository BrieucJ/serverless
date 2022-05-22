import { GraphQLError, GraphQLFormattedError } from 'graphql'

export default (error: GraphQLError): GraphQLFormattedError => {
  if (error.message.startsWith('Variable "$email"')) {
    error.message = 'email_is_required'
  }
  if (error.message.startsWith('Variable "$username"')) {
    error.message = 'username_is_required'
  }
  if (error.message.startsWith('Variable "$password"')) {
    error.message = 'password_is_required'
  }
  return error
}
