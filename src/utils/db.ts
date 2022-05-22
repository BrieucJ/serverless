// import { MongoClient, Db } from 'mongodb'

// const database_name = `database_${process.env.NODE_ENV!}`
// export const client = new MongoClient(process.env.DATABASE_URL!)

// export let db: Db

// export const connect = async () => {
//   const conn = await client.connect()
//   db = conn.db(database_name)
//   return client
// }

import mongoose, { Connection } from 'mongoose'

export let db: Connection

export const connect = async () => {
  await mongoose.connect(process.env.DATABASE_URL!)
  db = mongoose.connection
}
