import { estates, staff } from '../data/mockData.js'
import type { Estate, Staff } from '../types/index.js'
import { broadcast } from './WSService.js'

export const EstateService = {
  getAllEstates(): Estate[] {
    return estates
  },

  getEstateById(id: string): Estate | undefined {
    return estates.find(e => e.id === id)
  },

  getEstateStaff(estateId: string): Staff[] {
    return staff.filter(s => s.estateId === estateId)
  },

  updateEstate(id: string, updates: Partial<Estate>): Estate | undefined {
    const estate = estates.find(e => e.id === id)
    if (!estate) return undefined

    Object.assign(estate, updates)
    broadcast('estate_updated', estate)
    return estate
  }
}
