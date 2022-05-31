import { default as AuthResolver } from './auth.js'
import { default as UserResolver } from './user.js'
import { default as TranslationResolver } from './translation.js'

export default {
  Query: {
    ...AuthResolver.Query,
    ...UserResolver.Query,
    ...TranslationResolver.Query,
  },
  Mutation: {
    ...AuthResolver.Mutation,
    ...UserResolver.Mutation,
    ...TranslationResolver.Mutation,
  },
}
