export const seo = {
  title: '辛壬癸 | 生活记录、命理研究、杂谈、个人博客',
  description:
    '我是辛壬癸，一个热爱生活、喜欢记录和思考的人。 ',
  url: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://xinrengui.eu.org'
      : 'http://localhost:3000'
  ),
} as const
