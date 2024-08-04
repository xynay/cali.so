import Image from 'next/image'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'

import { Heading, Section } from './_components'
import Layout from './Layout'

const NewslettersTemplate = (props: {
  subject?: string | null
  body?: string | null
}) => {
  const { subject = '测试主题', body = `## 测试内容` } = props

  return (
    <Layout previewText={subject ?? ''}>
      <Heading>{subject}</Heading>

      {body && (
        <Section className="max-w-[465px] px-2 text-[14px] leading-loose text-zinc-700">
          <ReactMarkdown
            components={{
              img: ({ src, alt }) => {
                return (
                  <Image
                    src={src ?? ''}
                    alt={alt ?? ''}
                    width={465}
                    height={0}
                    layout="responsive"
                    className="mx-auto my-0 max-w-[465px]"
                  />
                )
              },
            }}
          >
            {body}
          </ReactMarkdown>
        </Section>
      )}
    </Layout>
  )
}

export default NewslettersTemplate