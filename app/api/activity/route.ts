import { NextResponse } from 'next/server'

export function GET() {
  try {
    // 示例返回的数据
    const app = 'Example data'

    // 使用 NextResponse 来构建响应
    return NextResponse.json({
      app,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}