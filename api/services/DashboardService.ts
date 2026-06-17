import { estates, staff, rooms, alerts } from '../data/mockData.js'
import type { DashboardSummary } from '../types/index.js'

export const DashboardService = {
  getSummary(): DashboardSummary {
    const totalEstates = estates.length

    const totalStaff = staff.length
    const staffOnDuty = staff.filter(s => s.status === 'on_duty').length

    const todayExpense = estates.reduce((sum, e) => sum + e.dailyExpense, 0)

    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    const activeAlerts = alerts.filter(a => a.status !== 'resolved')
    const highPriorityAlerts = activeAlerts.filter(a => a.priority === 'high').length
    const mediumPriorityAlerts = activeAlerts.filter(a => a.priority === 'medium').length
    const lowPriorityAlerts = activeAlerts.filter(a => a.priority === 'low').length

    const pendingBookings = 0

    const monthlyTrend = [
      { date: '06-11', revenue: 2850000, expense: 1850000 },
      { date: '06-12', revenue: 3120000, expense: 1920000 },
      { date: '06-13', revenue: 2680000, expense: 1780000 },
      { date: '06-14', revenue: 3450000, expense: 2150000 },
      { date: '06-15', revenue: 3780000, expense: 2280000 },
      { date: '06-16', revenue: 3520000, expense: 2050000 },
      { date: '06-17', revenue: 3950000, expense: 2450000 },
    ]

    return {
      totalEstates,
      totalStaff,
      staffOnDuty,
      todayExpense,
      occupancyRate,
      totalRooms,
      occupiedRooms,
      pendingBookings,
      highPriorityAlerts,
      mediumPriorityAlerts,
      lowPriorityAlerts,
      monthlyTrend,
    }
  }
}
