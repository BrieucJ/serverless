import { Context, UserType } from '../utils/types.js'
import { User } from '../models/index.js'
import { Authenticated } from '../utils/authentication.js'

export default {
  Query: {
    async me(_parent: any, _args: any, context: Context, _info: any): Promise<UserType | null> {
      const ctx: Context = Authenticated(context)
      const user = await User.findById(ctx.user?._id)
      return user
    },
    async users(_parent: any, _args: any, context: Context, _info: any): Promise<UserType[] | null> {
      Authenticated(context)
      const users: UserType[] | null = await User.find({})
      return users
    },
  },
  Mutation: {},
}
