import { db } from '../utils/db.js'
import { ObjectId } from 'mongodb'
import { hashPassword } from '../utils/authentication.js'
import { userSchema } from '../models/index.js'
import { RegisterInput } from '../utils/types.js'
// import logger from '../utils/logger.js'

export const create = async (params: RegisterInput) => {
  const defaultParams = {
    createdAt: new Date(),
    updatedAt: new Date(),
    confirmed: false,
  }
  params = { ...defaultParams, ...params }
  params.password = hashPassword(params.password)
  const validatedParmas = await userSchema.validateAsync(params, { abortEarly: false })
  return await db.collection('users').insertOne(validatedParmas)
}

export const getById = async (id: string) => {
  return await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })
}
