import { estates, staff, rooms, alerts } from '../data/mockData.js'
import type { DashboardSummary } from '../types/index.js'

export const DashboardService = {
  getSummary(): DashboardSummary {
    const totalEstates = estates.length

    const totalOnDuty = staff.filter(s => s.status === 'on_duty').length

    const todayRevenue = rooms
      .filter(r => r.status === 'occupied')
      .reduce((sum) => sum + (1500 + Math.floor(Math.random() * 3500)), 0)

    const todayExpense = estates.reduce((sum, e) => sum + e.dailyExpense, 0)

    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    const todayGuests = occupiedRooms

    const activeAlerts = alerts.filter(a => a.status !== 'resolved')
    const alertCounts = {
      high: activeAlerts.filter(a => a.priority === 'high').length,
      medium: activeAlerts.filter(a => a.priority === 'medium').length,
      low: activeAlerts.filter(a => a.priority === 'low').length
    }

    const todayReceptions = estates.flatMap(e => e.todayReceptions)

    return {
      totalEstates,
      totalOnDuty,
      todayRevenue,
      todayExpense,
      occupancyRate,
      todayGuests,
      activeAlerts: alertCounts,
      todayReceptions
    }
  }
}
