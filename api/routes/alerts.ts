import { Router, type Request, type Response } from 'express'
import { AlertService } from '../services/AlertService.js'
import type { AlertStatus, AlertPriority, AlertType } from '../types/index.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  try {
    const { estateId, status, priority, type } = req.query
    const alerts = AlertService.getAlerts({
      estateId: estateId as string | undefined,
      status: status as AlertStatus | undefined,
      priority: priority as AlertPriority | undefined,
      type: type as AlertType | undefined
    })
    res.json({ success: true, data: alerts })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

router.post('/:id/handle', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { handlerId, newStatus } = req.body
    if (!handlerId) {
      res.status(400).json({ success: false, error: 'handlerId is required' })
      return
    }
    const result = AlertService.handleAlert({
      alertId: id,
      handlerId,
      newStatus: newStatus as AlertStatus | undefined
    })
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error })
      return
    }
    res.json({ success: true, data: result.alert })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

export default router
