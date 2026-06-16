import { Router, type Request, type Response } from 'express'
import { DashboardService } from '../services/DashboardService.js'

const router = Router()

router.get('/summary', (req: Request, res: Response) => {
  try {
    const summary = DashboardService.getSummary()
    res.json({ success: true, data: summary })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

export default router
