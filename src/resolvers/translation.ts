import { Context, translationInput } from '../utils/types.js'
import { Translation } from '../models/index.js'

export default {
  Query: {
    async translations(_parent: any, args: translationInput, _context: Context, _info: any): Promise<any> {
      const translations = await Translation.find({ locale: args.locale, ns: args.ns })
      return translations
    },
  },
  Mutation: {},
}
