import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userCount = await prisma.user.count()
    return res.status(200).json({ userCount })
  } catch (error) {
    console.error("[First setup] Database check failed:", error)
    return res.status(503).json({
      userCount: 0,
      error: "Database unavailable",
    })
  }
}