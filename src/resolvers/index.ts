import { default as AuthResolver } from './auth.js'
import { default as UserResolver } from './user.js'

export default {
  Query: {
    ...AuthResolver.Query,
    ...UserResolver.Query,
  },
  Mutation: {
    ...AuthResolver.Mutation,
    ...UserResolver.Mutation,
  },
}
