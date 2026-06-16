import { schedules, staff } from '../data/mockData.js'
import type { Schedule, ShiftType } from '../types/index.js'
import { broadcast } from './WSService.js'

export const ScheduleService = {
  getSchedules(params?: { date?: string; estateId?: string; staffId?: string }): Schedule[] {
    let result = [...schedules]
    if (params?.date) result = result.filter(s => s.date === params.date)
    if (params?.estateId) result = result.filter(s => s.estateId === params.estateId)
    if (params?.staffId) result = result.filter(s => s.staffId === params.staffId)
    return result
  },

  updateSchedule(id: string, updates: Partial<Schedule>): Schedule | undefined {
    const schedule = schedules.find(s => s.id === id)
    if (!schedule) return undefined

    Object.assign(schedule, updates)
    broadcast('schedule_updated', schedule)
    return schedule
  },

  transferStaff(params: {
    scheduleId: string
    fromStaffId: string
    toStaffId: string
    date: string
    shift: ShiftType
    zoneId?: string
  }): { success: boolean; newSchedule?: Schedule; error?: string } {
    const { scheduleId, fromStaffId, toStaffId, date, shift, zoneId } = params

    const oldSchedule = schedules.find(s => s.id === scheduleId)
    if (!oldSchedule) {
      return { success: false, error: 'Schedule not found' }
    }

    const toStaff = staff.find(s => s.id === toStaffId)
    if (!toStaff) {
      return { success: false, error: 'Target staff not found' }
    }

    const existing = schedules.find(s =>
      s.staffId === toStaffId && s.date === date && s.shift === shift
    )
    if (existing) {
      return { success: false, error: 'Target staff already has a schedule for this shift' }
    }

    oldSchedule.staffId = toStaffId
    oldSchedule.zoneId = zoneId ?? oldSchedule.zoneId

    broadcast('staff_transferred', {
      fromStaffId,
      toStaffId,
      schedule: oldSchedule
    })

    return { success: true, newSchedule: oldSchedule }
  }
}
