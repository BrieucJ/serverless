import './config.js'
import { connect, db } from '../utils/db.js'
import glob from 'glob'
import logger from './logger.js'
import fs from 'fs'
import { Translation } from '../models/index.js'

export const seed = async () => {
  console.log('SEED')
  logger.info('Seeding')
  await connect()
  logger.info('Seeding translations')
  const files = glob.sync('src/locales/**/*.json')
  await Promise.all(
    files.map(async (file: string) => {
      const locale = file.split('/')[2]
      const ns = file.split('/')[3].split('.')[0]
      const translations = JSON.parse(fs.readFileSync(file, 'utf8')) as [{ [s: string]: string }]
      await Promise.allSettled(
        Object.entries(translations).map(async (t) => {
          await Translation.create({
            key: t[0],
            value: t[1],
            locale: locale,
            ns: ns,
          })
            .catch((error: any) => {
              /* eslint-disable @typescript-eslint/no-unsafe-assignment */
              logger.error(`Error inserting`, { error })
            })
            .then(() => {
              return true
            })
        }),
      )
    }),
  )
  await db.close()
  logger.info('Finished seeding')
}

if (process.argv[2] === 'seed') {
  seed().catch((error) => {
    console.log(error)
  })
}
