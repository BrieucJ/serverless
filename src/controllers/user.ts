import { db } from '../utils/db.js'
import { ObjectId } from 'mongodb'
import { hashPassword } from '../utils/authentication.js'
import { userSchema } from '../models/index.js'
import { RegisterInput, UserType } from '../utils/types.js'
import logger from '../utils/logger.js'

export const create = async (params: RegisterInput) => {
  const defaultParams = {
    createdAt: new Date(),
    updatedAt: new Date(),
    confirmed: false,
  }
  params = { ...defaultParams, ...params }
  params.password = hashPassword(params.password)
  const validatedParams: UserType = (await userSchema.validateAsync(params, { abortEarly: false })) as UserType
  let start: any = new Date()
  const resp = await db.collection('users').insertOne(validatedParams)
  let end: any = new Date()
  logger.info(`insertOne ${end - start}`)
  return resp
}

export const getById = async (id: string) => {
  return await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })
}
