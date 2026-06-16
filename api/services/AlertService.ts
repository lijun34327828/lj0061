import { alerts } from '../data/mockData.js'
import type { Alert, AlertStatus, AlertPriority, AlertType } from '../types/index.js'
import { broadcast } from './WSService.js'

export const AlertService = {
  getAlerts(params?: {
    estateId?: string
    status?: AlertStatus
    priority?: AlertPriority
    type?: AlertType
  }): Alert[] {
    let result = [...alerts]
    if (params?.estateId) result = result.filter(a => a.estateId === params.estateId)
    if (params?.status) result = result.filter(a => a.status === params.status)
    if (params?.priority) result = result.filter(a => a.priority === params.priority)
    if (params?.type) result = result.filter(a => a.type === params.type)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  handleAlert(params: {
    alertId: string
    handlerId: string
    newStatus?: AlertStatus
  }): { success: boolean; alert?: Alert; error?: string } {
    const { alertId, handlerId, newStatus = 'handling' } = params

    const alert = alerts.find(a => a.id === alertId)
    if (!alert) {
      return { success: false, error: 'Alert not found' }
    }

    if (alert.status === 'resolved') {
      return { success: false, error: 'Alert already resolved' }
    }

    alert.status = newStatus
    alert.handlerId = handlerId

    broadcast('alert_updated', alert)
    return { success: true, alert }
  }
}
