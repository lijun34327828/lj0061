import { Router, type Request, type Response } from 'express'
import { EstateService } from '../services/EstateService.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  try {
    const estates = EstateService.getAllEstates()
    res.json({ success: true, data: estates })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const estate = EstateService.getEstateById(id)
    if (!estate) {
      res.status(404).json({ success: false, error: 'Estate not found' })
      return
    }
    res.json({ success: true, data: estate })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

router.get('/:id/staff', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const estate = EstateService.getEstateById(id)
    if (!estate) {
      res.status(404).json({ success: false, error: 'Estate not found' })
      return
    }
    const staff = EstateService.getEstateStaff(id)
    res.json({ success: true, data: staff })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

export default router
