import { db, connect } from '../utils/db.js'
import { gql } from 'apollo-server-express'
import { seed } from '../utils/seed.js'
import { initTestServer } from '../utils/testing.js'
import fs from 'fs'
import path from 'path'

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

const TRANSLATIONS_QUERY = gql`
  query getTranslation($locale: String!, $ns: String!) {
    translations(locale: $locale, ns: $ns) {
      key
      value
      locale
      ns
    }
  }
`

describe('User resolver', () => {
  let testServer: any

  beforeAll(async () => {
    await seed()
    await connect()
    testServer = await initTestServer()
  })

  it('translation Query | should return common french translations', async () => {
    const json = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../locales/fr/common.json'), 'utf8'))
    const jsonTrads = Object.entries(json).map((t) => {
      return {
        key: t[0],
        value: t[1],
        locale: 'fr',
        ns: 'common',
      }
    })

    const result = await testServer.execute({
      query: TRANSLATIONS_QUERY,
      variables: { locale: 'fr', ns: 'common' },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.translations).toEqual(expect.arrayContaining(jsonTrads))
    expect(jsonTrads).toEqual(expect.arrayContaining(result.data?.translations))
  })

  it('translation Query | should return common english translations', async () => {
    const json = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../locales/en/common.json'), 'utf8'))
    const jsonTrads = Object.entries(json).map((t) => {
      return {
        key: t[0],
        value: t[1],
        locale: 'en',
        ns: 'common',
      }
    })

    const result = await testServer.execute({
      query: TRANSLATIONS_QUERY,
      variables: { locale: 'en', ns: 'common' },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.translations).toEqual(expect.arrayContaining(jsonTrads))
    expect(jsonTrads).toEqual(expect.arrayContaining(result.data?.translations))
  })

  afterAll(async () => {
    await testServer.stop()
    await db.dropDatabase()
    await db.close()
  })
})
