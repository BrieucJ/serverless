import { Context } from '../utils/types.js'
import { User } from '../entities/index.js'
import { Authenticated } from '../utils/authentication.js'

export default {
  Query: {
    async me(_parent: any, _args: any, context: Context, _info: any): Promise<User | null> {
      const ctx: Context = Authenticated(context)
      const user: User | null = await User.findOneBy({
        _id: ctx.user?._id,
      })
      return user
    },
    async users(_parent: any, _args: any, context: Context, _info: any): Promise<User[] | null> {
      Authenticated(context)
      const users: User[] | null = await User.find({})
      return users
    },
    async usersList(_parent: any, _args: any, context: Context, _info: any): Promise<User[] | null> {
      Authenticated(context)
      const users: User[] | null = await User.find({})
      return users
    },
  },
  Mutation: {},
}
