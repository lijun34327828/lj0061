import { Router, type Request, type Response } from 'express'
import { RoomService } from '../services/RoomService.js'
import type { RoomStatus } from '../types/index.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  try {
    const { estateId, floor, status } = req.query
    const rooms = RoomService.getRooms({
      estateId: estateId as string | undefined,
      floor: floor ? parseInt(floor as string) : undefined,
      status: status as RoomStatus | undefined
    })
    res.json({ success: true, data: rooms })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

router.get('/bookings', (req: Request, res: Response) => {
  try {
    const { estateId, status } = req.query
    const bookings = RoomService.getBookings({
      estateId: estateId as string | undefined,
      status: status as string | undefined
    })
    res.json({ success: true, data: bookings })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

router.post('/assign', (req: Request, res: Response) => {
  try {
    const { bookingId, roomId } = req.body
    if (!bookingId || !roomId) {
      res.status(400).json({ success: false, error: 'bookingId and roomId are required' })
      return
    }
    const result = RoomService.assignRoom({ bookingId, roomId })
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error })
      return
    }
    res.json({ success: true, data: { booking: result.booking, room: result.room } })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

export default router
