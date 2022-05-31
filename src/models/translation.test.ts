import '../utils/config.js'
import Translation from './translation.js'
import { db, connect } from '../utils/db.js'

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
describe('Translation model', () => {
  const newTranslation = {
    key: 'test',
    value: 'test_value',
    locale: 'en',
    ns: 'common',
  }

  beforeAll(async () => {
    await connect()
  })

  it('should create a new translation', async () => {
    const translation = await Translation.create(newTranslation)
    const translationCount = await Translation.countDocuments()
    expect(translationCount).toEqual(1)
    expect(translation?.key).toEqual(newTranslation.key)
    expect(translation?.value).toEqual(newTranslation.value)
    expect(translation?.locale).toEqual(newTranslation.locale)
    expect(translation?.ns).toEqual(newTranslation.ns)
  })

  it('should not create same translation', async () => {
    await Translation.create(newTranslation).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['key_locale'].message).toBe('key_and_locale_must_be_unique_together')
    })
  })

  afterAll(async () => {
    await db.dropDatabase()
    await db.close()
  })
})
