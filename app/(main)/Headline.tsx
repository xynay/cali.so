'use client'

import { motion } from 'framer-motion'
import React from 'react'
import Balancer from 'react-wrap-balancer'

import { SparkleIcon, UserSecurityIcon } from '~/assets'

// 使用静态样式类，减少动态计算
const borderClasses = `absolute size-1.5 border border-lime-700 bg-zinc-50 dark:border-lime-400`
const borderPositions = [
  '-left-[3.5px] -top-[3.5px]',
  '-bottom-[3.5px] -right-[3.5px]',
  '-bottom-[3.5px] -left-[3.5px]',
  '-right-[3.5px] -top-[3.5px]'
]

const Developer: React.FC = React.memo(() => (
  <span className="group text-2x2">
    <span className="font-mono">&lt;</span>探索者
    <span className="font-mono">/&gt;</span>
    <span className="invisible inline-flex text-zinc-300 before:content-['|'] group-hover:visible group-hover:animate-typing dark:text-zinc-500" />
  </span>
))
Developer.displayName = 'Developer'

const Designer: React.FC = React.memo(() => (
  <span className="group relative bg-black/5 p-1 dark:bg-white/5 text-2x2">
    <span className="pointer-events-none absolute inset-0 border border-lime-700/90 opacity-70 group-hover:border-dashed group-hover:opacity-100 dark:border-lime-400/90">
      {borderPositions.map((pos, index) => (
        <span key={index} className={`${borderClasses} ${pos}`} />
      ))}
    </span>
    生活家
  </span>
))
Designer.displayName = 'Designer'

const OCD: React.FC = React.memo(() => (
  <span className="group inline-flex items-center text-2x2">
    <SparkleIcon className="mr-1 inline-flex transform-gpu transition-transform duration-500 group-hover:rotate-180" />
    <span>记录者</span>
  </span>
))
OCD.displayName = 'OCD'

const Founder: React.FC = React.memo(() => (
  <span className="group inline-flex items-center text-2x2">
    <UserSecurityIcon className="mr-1 inline-flex group-hover:fill-zinc-600/20 dark:group-hover:fill-zinc-200/20" />
    <span>思考者</span>
  </span>
))
Founder.displayName = 'Founder'

const Headline: React.FC = () => (
  <div className="max-w-2xl mx-auto text-center">
    <motion.h1
      className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 100,
        duration: 0.3,
      }}
    >
      <div className="flex flex-wrap justify-center">
        <Developer />，<Designer />，<OCD />，<Founder />
      </div>
    </motion.h1>
    <motion.p
      className="mt-6 text-lg text-zinc-600 dark:text-zinc-400"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 85,
        duration: 0.3,
        delay: 0.1,
      }}
    >
      <Balancer>
        我是辛壬癸，一个热爱生活、喜欢记录和思考的人。
        我的博客“辛壬癸的日常笔记”主要分享生活记录、命理研究和个人杂谈。
        在这里，我通过文字记录生活的点滴，探索命理的奥秘，并分享我的见解和思考。
      </Balancer>
    </motion.p>
  </div>
)
Headline.displayName = 'Headline'

const Page: React.FC = () => {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {loading ? (
        <div className="text-center">
          <div className="loader mb-4" />
          <p>Loading...</p>
        </div>
      ) : (
        <Headline />
      )}
    </div>
  )
}

export default Page