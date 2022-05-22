import mongoose, { Connection } from 'mongoose'

export let db: Connection

export const connect = async () => {
  await mongoose.connect(process.env.DATABASE_URL!)
  db = mongoose.connection
}
