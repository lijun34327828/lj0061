export type AlertPriority = 'high' | 'medium' | 'low';
export type AlertStatus = 'pending' | 'handling' | 'resolved';
export type AlertType = 'inventory' | 'equipment' | 'staff' | 'security' | 'finance';

export type StaffRole = 'butler' | 'security' | 'logistics' | 'chef' | 'gardener' | 'driver';
export type StaffStatus = 'on_duty' | 'off_duty' | 'leave' | 'training';
export type ShiftType = 'morning' | 'afternoon' | 'night';

export type RoomStatus = 'vacant' | 'occupied' | 'cleaning' | 'maintenance';
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential';

export type ZoneType = 'main' | 'guest' | 'exhibition' | 'horse' | 'marina';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

export interface Coordinates {
  x: number;
  y: number;
}

export interface EstateLocation {
  country: string;
  city: string;
  lat: number;
  lng: number;
}

export interface EstateZone {
  id: string;
  name: string;
  type: ZoneType;
  bounds: { x: number; y: number; width: number; height: number };
  health: number;
  staffCount: number;
  alerts: number;
  description: string;
  status?: { healthScore: number; alertCount: number };
}

export interface Estate {
  id: string;
  name: string;
  location: EstateLocation;
  mapPosition: { x: number; y: number };
  staffCount: number;
  roomCount: number;
  occupancyRate: number;
  todayExpense: number;
  status: 'active' | 'maintenance' | 'closed';
  zones: EstateZone[];
  image?: string;
}

export interface Staff {
  id: string;
  name: string;
  avatar: string;
  role: StaffRole;
  status: StaffStatus;
  estateId: string;
  estateName?: string;
  zoneId?: string;
  phone?: string;
  email?: string;
  hireDate?: string;
}

export interface ScheduleShift {
  id: string;
  staffId: string;
  staffName?: string;
  date: string;
  shift: ShiftType;
  zoneId?: string;
  note?: string;
}

export interface Schedule {
  id: string;
  estateId: string;
  weekStart: string;
  shifts: ScheduleShift[];
}

export interface TransferRequest {
  id?: string;
  staffId: string;
  fromEstateId: string;
  toEstateId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  estateId: string;
  zoneId?: string;
  pricePerNight: number;
  capacity: number;
  lastCleaned?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  guestName: string;
  guestAvatar?: string;
  checkIn: string;
  checkOut: string;
  roomType: RoomType;
  status: BookingStatus;
  estateId: string;
  roomId?: string;
  guests: number;
  totalPrice: number;
  notes?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  estateId: string;
  estateName?: string;
  zoneId?: string;
  status: AlertStatus;
  handlerId?: string;
  handlerName?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface HandleAlertRequest {
  id: string;
  handlerId: string;
  note?: string;
}

export interface AssignRoomRequest {
  bookingId: string;
  roomId: string;
}

export interface DashboardSummary {
  totalEstates: number;
  totalStaff: number;
  staffOnDuty: number;
  todayExpense: number;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  pendingBookings: number;
  highPriorityAlerts: number;
  mediumPriorityAlerts: number;
  lowPriorityAlerts: number;
  monthlyTrend: { date: string; revenue: number; expense: number }[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  estateId: string;
  estateName: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  progress: number;
  color: string;
}

export interface WSMessage {
  type: 'alert' | 'booking' | 'schedule' | 'status';
  data: unknown;
  timestamp: string;
}
