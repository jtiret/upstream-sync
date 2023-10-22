import { MessageEntity } from './MessageEntity'

describe('MessageEntity', () => {
  test('stripHtml', () => {
    const htmlText = '<div>Hello, <i>world</i>!</div>'
    expect(MessageEntity.stripHtml(htmlText)).toMatchSnapshot()
  })
})
