export interface Location {
  country: string
  city: string
  lat: number
  lng: number
}

export type ZoneType = 'main_building' | 'guest_room' | 'exhibition' | 'horse_farm' | 'marina'

export interface EstateZone {
  id: string
  type: ZoneType
  name: string
  bounds: { x: number; y: number; width: number; height: number }
  color: string
  status: { healthScore: number; alertCount: number }
  onDutyStaff: string[]
}

export interface Reception {
  id: string
  guestName: string
  time: string
  estateId: string
  estateName: string
  type: string
  status: string
}

export interface Estate {
  id: string
  name: string
  location: Location
  zones: EstateZone[]
  dailyExpense: number
  todayReceptions: Reception[]
}

export type StaffRole = 'butler' | 'security' | 'logistics'

export type StaffStatus = 'on_duty' | 'off_duty' | 'leave' | 'transferred'

export interface Staff {
  id: string
  name: string
  role: StaffRole
  estateId: string
  avatar: string
  status: StaffStatus
  currentZoneId?: string
}

export type ShiftType = 'morning' | 'afternoon' | 'night'

export interface Schedule {
  id: string
  staffId: string
  estateId: string
  date: string
  shift: ShiftType
  zoneId?: string
}

export type RoomStatus = 'vacant' | 'occupied' | 'cleaning' | 'maintenance'

export interface Guest {
  name: string
  avatar?: string
}

export interface Room {
  id: string
  estateId: string
  floor: number
  roomNo: string
  type: string
  status: RoomStatus
  currentGuest?: Guest
}

export type BookingStatus = 'pending' | 'checked_in' | 'checked_out'

export interface Booking {
  id: string
  guestName: string
  guestAvatar?: string
  roomId?: string
  checkIn: string
  checkOut: string
  status: BookingStatus
}

export type AlertType = 'facility_damage' | 'supply_shortage' | 'staff_abnormal'

export type AlertPriority = 'high' | 'medium' | 'low'

export type AlertStatus = 'pending' | 'handling' | 'resolved'

export interface Alert {
  id: string
  estateId: string
  zoneId?: string
  type: AlertType
  priority: AlertPriority
  title: string
  description: string
  createdAt: string
  status: AlertStatus
  handlerId?: string
}

export interface DashboardSummary {
  totalEstates: number
  totalOnDuty: number
  todayRevenue: number
  todayExpense: number
  occupancyRate: number
  todayGuests: number
  activeAlerts: { high: number; medium: number; low: number }
  todayReceptions: Reception[]
}

export interface WSMessage {
  type: string
  data: unknown
}
