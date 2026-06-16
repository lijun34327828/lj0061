import { Router, type Request, type Response } from 'express'
import { ScheduleService } from '../services/ScheduleService.js'
import type { ShiftType } from '../types/index.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  try {
    const { date, estateId, staffId } = req.query
    const schedules = ScheduleService.getSchedules({
      date: date as string | undefined,
      estateId: estateId as string | undefined,
      staffId: staffId as string | undefined
    })
    res.json({ success: true, data: schedules })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

router.put('/', (req: Request, res: Response) => {
  try {
    const { id, ...updates } = req.body
    if (!id) {
      res.status(400).json({ success: false, error: 'Schedule id is required' })
      return
    }
    const schedule = ScheduleService.updateSchedule(id, updates)
    if (!schedule) {
      res.status(404).json({ success: false, error: 'Schedule not found' })
      return
    }
    res.json({ success: true, data: schedule })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

router.post('/transfer', (req: Request, res: Response) => {
  try {
    const { scheduleId, fromStaffId, toStaffId, date, shift, zoneId } = req.body
    if (!scheduleId || !fromStaffId || !toStaffId || !date || !shift) {
      res.status(400).json({ success: false, error: 'Missing required fields' })
      return
    }
    const result = ScheduleService.transferStaff({
      scheduleId,
      fromStaffId,
      toStaffId,
      date,
      shift: shift as ShiftType,
      zoneId
    })
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error })
      return
    }
    res.json({ success: true, data: result.newSchedule })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

export default router
