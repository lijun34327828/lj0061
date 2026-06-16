import { rooms, bookings } from '../data/mockData.js'
import type { Room, Booking, RoomStatus } from '../types/index.js'
import { broadcast } from './WSService.js'

export const RoomService = {
  getRooms(params?: { estateId?: string; floor?: number; status?: RoomStatus }): Room[] {
    let result = [...rooms]
    if (params?.estateId) result = result.filter(r => r.estateId === params.estateId)
    if (params?.floor) result = result.filter(r => r.floor === params.floor)
    if (params?.status) result = result.filter(r => r.status === params.status)
    return result
  },

  getBookings(params?: { estateId?: string; status?: string }): Booking[] {
    let result = [...bookings]
    if (params?.status) result = result.filter(b => b.status === params.status)
    if (params?.estateId) {
      const estateRooms = rooms.filter(r => r.estateId === params.estateId).map(r => r.id)
      result = result.filter(b => b.roomId && estateRooms.includes(b.roomId))
    }
    return result
  },

  assignRoom(params: {
    bookingId: string
    roomId: string
  }): { success: boolean; booking?: Booking; room?: Room; error?: string } {
    const { bookingId, roomId } = params

    const booking = bookings.find(b => b.id === bookingId)
    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    const room = rooms.find(r => r.id === roomId)
    if (!room) {
      return { success: false, error: 'Room not found' }
    }

    if (room.status !== 'vacant') {
      return { success: false, error: 'Room is not vacant' }
    }

    booking.roomId = roomId
    booking.status = 'checked_in'
    room.status = 'occupied'
    room.currentGuest = {
      name: booking.guestName,
      avatar: booking.guestAvatar
    }

    broadcast('room_assigned', { booking, room })
    return { success: true, booking, room }
  },

  updateRoomStatus(roomId: string, status: RoomStatus): Room | undefined {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return undefined

    room.status = status
    if (status === 'vacant' || status === 'cleaning' || status === 'maintenance') {
      room.currentGuest = undefined
    }

    broadcast('room_updated', room)
    return room
  }
}
