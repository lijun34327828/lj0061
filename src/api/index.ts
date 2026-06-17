import type {
  Estate,
  Staff,
  Schedule,
  ScheduleShift,
  TransferRequest,
  Room,
  Booking,
  Alert,
  DashboardSummary,
  TimelineEvent,
  HandleAlertRequest,
  AssignRoomRequest,
} from '@/types';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json() as ApiResponse<T>;
    if (json.success && json.data !== undefined) {
      return json.data;
    }
    return getMockData<T>(url);
  } catch (error) {
    console.warn(`API ${url} failed, using mock data`, error);
    return getMockData<T>(url);
  }
}

const mockEstates: Estate[] = [
  {
    id: 'estate-1',
    name: '香波城堡庄园',
    location: { country: '法国', city: '卢瓦尔河谷', lat: 47.62, lng: 1.52 },
    mapPosition: { x: 48, y: 32 },
    staffCount: 156,
    roomCount: 48,
    occupancyRate: 87,
    todayExpense: 128500,
    status: 'active',
    zones: [
      { id: 'z1', name: '主城堡', type: 'main', bounds: { x: 50, y: 50, width: 200, height: 120 }, health: 95, staffCount: 45, alerts: 1, description: '核心建筑区，含宴会厅与接待厅' },
      { id: 'z2', name: '客房区', type: 'guest', bounds: { x: 280, y: 80, width: 180, height: 150 }, health: 88, staffCount: 38, alerts: 0, description: '豪华套房与标准客房' },
      { id: 'z3', name: '艺术展厅', type: 'exhibition', bounds: { x: 80, y: 200, width: 160, height: 100 }, health: 92, staffCount: 22, alerts: 2, description: '古典艺术收藏展厅' },
      { id: 'z4', name: '马场', type: 'horse', bounds: { x: 280, y: 260, width: 150, height: 110 }, health: 85, staffCount: 28, alerts: 0, description: '皇家马场与驯马设施' },
      { id: 'z5', name: '私家码头', type: 'marina', bounds: { x: 470, y: 150, width: 140, height: 90 }, health: 90, staffCount: 23, alerts: 1, description: '卢瓦尔河游船码头' },
    ],
  },
  {
    id: 'estate-2',
    name: '托斯卡纳庄园',
    location: { country: '意大利', city: '佛罗伦萨', lat: 43.77, lng: 11.26 },
    mapPosition: { x: 54, y: 36 },
    staffCount: 98,
    roomCount: 32,
    occupancyRate: 75,
    todayExpense: 89200,
    status: 'active',
    zones: [
      { id: 'z6', name: '别墅主楼', type: 'main', bounds: { x: 100, y: 80, width: 180, height: 130 }, health: 96, staffCount: 30, alerts: 0, description: '文艺复兴风格主楼' },
      { id: 'z7', name: '客房别墅', type: 'guest', bounds: { x: 320, y: 60, width: 160, height: 140 }, health: 91, staffCount: 25, alerts: 1, description: '独立别墅客房' },
      { id: 'z8', name: '葡萄酒庄', type: 'exhibition', bounds: { x: 60, y: 240, width: 170, height: 110 }, health: 87, staffCount: 18, alerts: 0, description: '葡萄酒庄与品鉴室' },
      { id: 'z9', name: '橄榄园', type: 'horse', bounds: { x: 270, y: 230, width: 140, height: 130 }, health: 93, staffCount: 15, alerts: 0, description: '有机橄榄种植园' },
      { id: 'z10', name: '湖畔码头', type: 'marina', bounds: { x: 450, y: 180, width: 130, height: 100 }, health: 89, staffCount: 10, alerts: 0, description: '私人湖畔码头' },
    ],
  },
  {
    id: 'estate-3',
    name: '苏格兰高地庄园',
    location: { country: '英国', city: '苏格兰高地', lat: 57.0, lng: -4.5 },
    mapPosition: { x: 44, y: 24 },
    staffCount: 124,
    roomCount: 40,
    occupancyRate: 68,
    todayExpense: 105600,
    status: 'active',
    zones: [
      { id: 'z11', name: '城堡主楼', type: 'main', bounds: { x: 70, y: 60, width: 200, height: 140 }, health: 89, staffCount: 38, alerts: 1, description: '中世纪风格城堡' },
      { id: 'z12', name: '狩猎小屋', type: 'guest', bounds: { x: 310, y: 90, width: 150, height: 120 }, health: 86, staffCount: 24, alerts: 1, description: '奢华狩猎小屋' },
      { id: 'z13', name: '威士忌酒窖', type: 'exhibition', bounds: { x: 120, y: 230, width: 160, height: 100 }, health: 94, staffCount: 16, alerts: 0, description: '百年威士忌酒窖' },
      { id: 'z14', name: '猎场', type: 'horse', bounds: { x: 320, y: 240, width: 170, height: 120 }, health: 91, staffCount: 28, alerts: 2, description: '皇家猎场' },
      { id: 'z15', name: '尼斯湖码头', type: 'marina', bounds: { x: 510, y: 160, width: 120, height: 90 }, health: 88, staffCount: 18, alerts: 0, description: '尼斯湖游船' },
    ],
  },
  {
    id: 'estate-4',
    name: '丽江雪山庄园',
    location: { country: '中国', city: '云南丽江', lat: 26.87, lng: 100.23 },
    mapPosition: { x: 75, y: 40 },
    staffCount: 142,
    roomCount: 56,
    occupancyRate: 92,
    todayExpense: 156800,
    status: 'active',
    zones: [
      { id: 'z16', name: '纳西主楼', type: 'main', bounds: { x: 90, y: 70, width: 190, height: 130 }, health: 97, staffCount: 42, alerts: 0, description: '纳西族风格主楼' },
      { id: 'z17', name: '雪山套房', type: 'guest', bounds: { x: 310, y: 50, width: 170, height: 150 }, health: 93, staffCount: 35, alerts: 1, description: '雪山景观套房' },
      { id: 'z18', name: '东巴文化馆', type: 'exhibition', bounds: { x: 80, y: 230, width: 180, height: 110 }, health: 90, staffCount: 20, alerts: 0, description: '东巴文化展示' },
      { id: 'z19', name: '茶马古道马场', type: 'horse', bounds: { x: 300, y: 240, width: 160, height: 120 }, health: 88, staffCount: 25, alerts: 0, description: '骑马体验区' },
      { id: 'z20', name: '黑龙潭码头', type: 'marina', bounds: { x: 490, y: 180, width: 140, height: 100 }, health: 95, staffCount: 20, alerts: 0, description: '黑龙潭游船' },
    ],
  },
  {
    id: 'estate-5',
    name: '加勒比海私人岛庄园',
    location: { country: '巴哈马', city: '拿骚', lat: 25.05, lng: -77.35 },
    mapPosition: { x: 22, y: 50 },
    staffCount: 186,
    roomCount: 72,
    occupancyRate: 81,
    todayExpense: 234500,
    status: 'active',
    zones: [
      { id: 'z21', name: '海滨主殿', type: 'main', bounds: { x: 80, y: 60, width: 210, height: 140 }, health: 94, staffCount: 55, alerts: 1, description: '海滨度假主楼' },
      { id: 'z22', name: '海滩别墅', type: 'guest', bounds: { x: 330, y: 40, width: 180, height: 160 }, health: 96, staffCount: 48, alerts: 0, description: '私人海滩别墅' },
      { id: 'z23', name: '海洋馆', type: 'exhibition', bounds: { x: 70, y: 230, width: 170, height: 120 }, health: 91, staffCount: 22, alerts: 0, description: '私人海洋展馆' },
      { id: 'z24', name: '热带花园', type: 'horse', bounds: { x: 280, y: 250, width: 160, height: 120 }, health: 87, staffCount: 32, alerts: 1, description: '热带植物园' },
      { id: 'z25', name: '游艇码头', type: 'marina', bounds: { x: 480, y: 150, width: 160, height: 120 }, health: 92, staffCount: 29, alerts: 2, description: '豪华游艇码头' },
    ],
  },
];

const mockStaff: Staff[] = [
  { id: 's1', name: '让·皮埃尔', avatar: '', role: 'butler', status: 'on_duty', estateId: 'estate-1', estateName: '香波城堡庄园' },
  { id: 's2', name: '玛丽·杜邦', avatar: '', role: 'chef', status: 'on_duty', estateId: 'estate-1', estateName: '香波城堡庄园' },
  { id: 's3', name: '克劳德·莫奈', avatar: '', role: 'gardener', status: 'on_duty', estateId: 'estate-1', estateName: '香波城堡庄园' },
  { id: 's4', name: '安德烈', avatar: '', role: 'security', status: 'on_duty', estateId: 'estate-1', estateName: '香波城堡庄园' },
  { id: 's5', name: '苏菲·玛索', avatar: '', role: 'butler', status: 'off_duty', estateId: 'estate-1', estateName: '香波城堡庄园' },
  { id: 's6', name: '马可·波罗', avatar: '', role: 'chef', status: 'on_duty', estateId: 'estate-2', estateName: '托斯卡纳庄园' },
  { id: 's7', name: '卢卡·罗西', avatar: '', role: 'logistics', status: 'on_duty', estateId: 'estate-2', estateName: '托斯卡纳庄园' },
  { id: 's8', name: '安娜·威尔逊', avatar: '', role: 'butler', status: 'on_duty', estateId: 'estate-3', estateName: '苏格兰高地庄园' },
  { id: 's9', name: '詹姆斯·邦德', avatar: '', role: 'security', status: 'on_duty', estateId: 'estate-3', estateName: '苏格兰高地庄园' },
  { id: 's10', name: '张伟', avatar: '', role: 'butler', status: 'on_duty', estateId: 'estate-4', estateName: '丽江雪山庄园' },
  { id: 's11', name: '李娜', avatar: '', role: 'chef', status: 'on_duty', estateId: 'estate-4', estateName: '丽江雪山庄园' },
  { id: 's12', name: '王芳', avatar: '', role: 'logistics', status: 'leave', estateId: 'estate-4', estateName: '丽江雪山庄园' },
  { id: 's13', name: '卡洛斯', avatar: '', role: 'butler', status: 'on_duty', estateId: 'estate-5', estateName: '加勒比海私人岛庄园' },
  { id: 's14', name: '玛利亚', avatar: '', role: 'driver', status: 'on_duty', estateId: 'estate-5', estateName: '加勒比海私人岛庄园' },
  { id: 's15', name: '杰克船长', avatar: '', role: 'security', status: 'on_duty', estateId: 'estate-5', estateName: '加勒比海私人岛庄园' },
];

const mockRooms: Room[] = [
  { id: 'r1', roomNumber: '101', floor: 1, type: 'standard', status: 'occupied', estateId: 'estate-1', pricePerNight: 2800, capacity: 2 },
  { id: 'r2', roomNumber: '102', floor: 1, type: 'standard', status: 'cleaning', estateId: 'estate-1', pricePerNight: 2800, capacity: 2 },
  { id: 'r3', roomNumber: '103', floor: 1, type: 'deluxe', status: 'vacant', estateId: 'estate-1', pricePerNight: 4500, capacity: 2 },
  { id: 'r4', roomNumber: '201', floor: 2, type: 'deluxe', status: 'occupied', estateId: 'estate-1', pricePerNight: 4500, capacity: 2 },
  { id: 'r5', roomNumber: '202', floor: 2, type: 'suite', status: 'vacant', estateId: 'estate-1', pricePerNight: 8800, capacity: 4 },
  { id: 'r6', roomNumber: '301', floor: 3, type: 'presidential', status: 'maintenance', estateId: 'estate-1', pricePerNight: 28000, capacity: 6 },
  { id: 'r7', roomNumber: '302', floor: 3, type: 'suite', status: 'occupied', estateId: 'estate-1', pricePerNight: 8800, capacity: 4 },
  { id: 'r8', roomNumber: '101', floor: 1, type: 'standard', status: 'vacant', estateId: 'estate-4', pricePerNight: 3200, capacity: 2 },
  { id: 'r9', roomNumber: '102', floor: 1, type: 'standard', status: 'occupied', estateId: 'estate-4', pricePerNight: 3200, capacity: 2 },
  { id: 'r10', roomNumber: '201', floor: 2, type: 'suite', status: 'vacant', estateId: 'estate-4', pricePerNight: 9600, capacity: 4 },
];

const mockBookings: Booking[] = [
  { id: 'b1', guestName: '罗斯柴尔德家族', checkIn: '2026-06-18', checkOut: '2026-06-22', roomType: 'presidential', status: 'confirmed', estateId: 'estate-1', guests: 4, totalPrice: 112000 },
  { id: 'b2', guestName: '洛克菲勒先生', checkIn: '2026-06-17', checkOut: '2026-06-20', roomType: 'suite', status: 'checked_in', estateId: 'estate-1', roomId: 'r5', guests: 2, totalPrice: 26400 },
  { id: 'b3', guestName: '摩根女士', checkIn: '2026-06-19', checkOut: '2026-06-21', roomType: 'deluxe', status: 'pending', estateId: 'estate-1', guests: 2, totalPrice: 9000 },
  { id: 'b4', guestName: '盖茨比夫妇', checkIn: '2026-06-20', checkOut: '2026-06-25', roomType: 'suite', status: 'confirmed', estateId: 'estate-5', guests: 3, totalPrice: 48000 },
  { id: 'b5', guestName: '王健林家族', checkIn: '2026-06-18', checkOut: '2026-06-23', roomType: 'presidential', status: 'pending', estateId: 'estate-4', guests: 6, totalPrice: 140000 },
  { id: 'b6', guestName: '马云先生', checkIn: '2026-06-21', checkOut: '2026-06-24', roomType: 'deluxe', status: 'confirmed', estateId: 'estate-4', guests: 2, totalPrice: 14400 },
];

const mockAlerts: Alert[] = [
  { id: 'a1', type: 'inventory', priority: 'high', title: '82年拉菲库存告急', description: '珍藏82年拉菲仅余3瓶，低于安全库存5瓶，请及时补货', estateId: 'estate-1', estateName: '香波城堡庄园', status: 'pending', createdAt: '2026-06-17T08:30:00Z' },
  { id: 'a2', type: 'equipment', priority: 'high', title: '主电梯故障', description: '主楼西侧 elev-02 号电梯发生故障，影响贵宾通行', estateId: 'estate-1', estateName: '香波城堡庄园', zoneId: 'z1', status: 'handling', handlerId: 's4', handlerName: '安德烈', createdAt: '2026-06-17T09:15:00Z' },
  { id: 'a3', type: 'staff', priority: 'medium', title: '安保人员不足', description: '马场区域安保排班存在空档，今日18:00-24:00缺2人', estateId: 'estate-3', estateName: '苏格兰高地庄园', zoneId: 'z14', status: 'pending', createdAt: '2026-06-17T07:45:00Z' },
  { id: 'a4', type: 'security', priority: 'high', title: '外围警戒异常', description: '东侧围墙传感器触发异常报警，请立即排查', estateId: 'estate-5', estateName: '加勒比海私人岛庄园', status: 'handling', handlerId: 's15', handlerName: '杰克船长', createdAt: '2026-06-17T10:00:00Z' },
  { id: 'a5', type: 'inventory', priority: 'medium', title: '客房布草存量不足', description: '豪华套房专用亚麻布草存量仅够3天使用', estateId: 'estate-2', estateName: '托斯卡纳庄园', status: 'pending', createdAt: '2026-06-17T06:20:00Z' },
  { id: 'a6', type: 'equipment', priority: 'low', title: '花园灌溉系统检修', description: '热带花园3区灌溉系统需要常规检修', estateId: 'estate-5', estateName: '加勒比海私人岛庄园', zoneId: 'z24', status: 'pending', createdAt: '2026-06-17T05:00:00Z' },
  { id: 'a7', type: 'finance', priority: 'medium', title: '本月采购预算超标', description: '酒庄采购费用已超月度预算15%，请关注', estateId: 'estate-2', estateName: '托斯卡纳庄园', status: 'resolved', handlerId: 's7', handlerName: '卢卡·罗西', createdAt: '2026-06-16T16:00:00Z', resolvedAt: '2026-06-17T09:00:00Z' },
  { id: 'a8', type: 'equipment', priority: 'medium', title: '游艇发动机保养', description: '「皇室号」游艇发动机需例行保养', estateId: 'estate-5', estateName: '加勒比海私人岛庄园', zoneId: 'z25', status: 'pending', createdAt: '2026-06-17T04:30:00Z' },
];

const mockScheduleShifts: ScheduleShift[] = [
  { id: 'sh1', staffId: 's1', staffName: '让·皮埃尔', date: '2026-06-16', shift: 'morning' },
  { id: 'sh2', staffId: 's1', staffName: '让·皮埃尔', date: '2026-06-17', shift: 'morning' },
  { id: 'sh3', staffId: 's1', staffName: '让·皮埃尔', date: '2026-06-18', shift: 'afternoon' },
  { id: 'sh4', staffId: 's2', staffName: '玛丽·杜邦', date: '2026-06-16', shift: 'morning' },
  { id: 'sh5', staffId: 's2', staffName: '玛丽·杜邦', date: '2026-06-17', shift: 'morning' },
  { id: 'sh6', staffId: 's3', staffName: '克劳德·莫奈', date: '2026-06-16', shift: 'afternoon' },
  { id: 'sh7', staffId: 's3', staffName: '克劳德·莫奈', date: '2026-06-17', shift: 'night' },
  { id: 'sh8', staffId: 's4', staffName: '安德烈', date: '2026-06-16', shift: 'night' },
  { id: 'sh9', staffId: 's4', staffName: '安德烈', date: '2026-06-17', shift: 'night' },
  { id: 'sh10', staffId: 's4', staffName: '安德烈', date: '2026-06-18', shift: 'morning' },
  { id: 'sh11', staffId: 's8', staffName: '安娜·威尔逊', date: '2026-06-16', shift: 'morning' },
  { id: 'sh12', staffId: 's8', staffName: '安娜·威尔逊', date: '2026-06-17', shift: 'morning' },
  { id: 'sh13', staffId: 's8', staffName: '安娜·威尔逊', date: '2026-06-18', shift: 'afternoon' },
  { id: 'sh14', staffId: 's10', staffName: '张伟', date: '2026-06-16', shift: 'morning' },
  { id: 'sh15', staffId: 's10', staffName: '张伟', date: '2026-06-17', shift: 'morning' },
];

const mockTimeline: TimelineEvent[] = [
  { id: 't1', time: '08:00', title: '香波城堡早餐接待', description: '罗斯柴尔德家族专属早餐', estateId: 'estate-1', estateName: '香波城堡庄园', status: 'completed', progress: 100, color: '#c9a962' },
  { id: 't2', time: '10:30', title: '托斯卡纳品酒会', description: 'VIP客户私人品鉴', estateId: 'estate-2', estateName: '托斯卡纳庄园', status: 'in_progress', progress: 65, color: '#722f37' },
  { id: 't3', time: '12:00', title: '丽江雪山午宴', description: '王健林家族午宴安排', estateId: 'estate-4', estateName: '丽江雪山庄园', status: 'in_progress', progress: 40, color: '#3d5a45' },
  { id: 't4', time: '14:30', title: '苏格兰狩猎活动', description: '高地猎场鹿猎活动', estateId: 'estate-3', estateName: '苏格兰高地庄园', status: 'upcoming', progress: 0, color: '#2e5e8b' },
  { id: 't5', time: '16:00', title: '加勒比游艇出海', description: '摩根家族私人游艇巡航', estateId: 'estate-5', estateName: '加勒比海私人岛庄园', status: 'upcoming', progress: 0, color: '#e8d5b7' },
  { id: 't6', time: '19:00', title: '香波城堡晚宴', description: '盖茨比夫妇欢迎晚宴', estateId: 'estate-1', estateName: '香波城堡庄园', status: 'upcoming', progress: 0, color: '#c9a962' },
  { id: 't7', time: '21:30', title: '私人音乐会', description: '丽江庄园星空音乐会', estateId: 'estate-4', estateName: '丽江雪山庄园', status: 'upcoming', progress: 0, color: '#3d5a45' },
];

const mockDashboard: DashboardSummary = {
  totalEstates: 5,
  totalStaff: 706,
  staffOnDuty: 489,
  todayExpense: 714600,
  occupancyRate: 80.6,
  totalRooms: 248,
  occupiedRooms: 200,
  pendingBookings: 42,
  highPriorityAlerts: 3,
  mediumPriorityAlerts: 4,
  lowPriorityAlerts: 1,
  monthlyTrend: [
    { date: '06-11', revenue: 2850000, expense: 1850000 },
    { date: '06-12', revenue: 3120000, expense: 1920000 },
    { date: '06-13', revenue: 2680000, expense: 1780000 },
    { date: '06-14', revenue: 3450000, expense: 2150000 },
    { date: '06-15', revenue: 3780000, expense: 2280000 },
    { date: '06-16', revenue: 3520000, expense: 2050000 },
    { date: '06-17', revenue: 3950000, expense: 2450000 },
  ],
};

function getMockData<T>(url: string): T {
  if (url.includes('/estates') && !url.includes('/staff')) {
    if (url.match(/\/estates\/[^/]+$/)) {
      const id = url.split('/').pop();
      return (mockEstates.find(e => e.id === id) || mockEstates[0]) as unknown as T;
    }
    return mockEstates as unknown as T;
  }
  if (url.includes('/staff')) return mockStaff as unknown as T;
  if (url.includes('/schedules')) {
    return { id: 'sch1', estateId: 'estate-1', weekStart: '2026-06-16', shifts: mockScheduleShifts } as unknown as T;
  }
  if (url.includes('/rooms')) return mockRooms as unknown as T;
  if (url.includes('/bookings')) return mockBookings as unknown as T;
  if (url.includes('/alerts')) return mockAlerts as unknown as T;
  if (url.includes('/dashboard') || url.includes('/summary')) return mockDashboard as unknown as T;
  if (url.includes('/timeline')) return mockTimeline as unknown as T;
  return {} as T;
}

export function fetchEstates(): Promise<Estate[]> {
  return request<Estate[]>('/estates');
}

export function fetchEstateById(id: string): Promise<Estate> {
  return request<Estate>(`/estates/${id}`);
}

export function fetchEstateStaff(id: string): Promise<Staff[]> {
  return request<Staff[]>(`/estates/${id}/staff`);
}

export function fetchSchedules(estateId?: string): Promise<Schedule> {
  const url = estateId ? `/schedules?estateId=${estateId}` : '/schedules';
  return request<Schedule>(url);
}

export function updateSchedule(data: ScheduleShift): Promise<ScheduleShift> {
  return request<ScheduleShift>('/schedules', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function transferStaff(data: TransferRequest): Promise<TransferRequest> {
  return request<TransferRequest>('/schedules/transfer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchRooms(estateId?: string): Promise<Room[]> {
  const url = estateId ? `/rooms?estateId=${estateId}` : '/rooms';
  return request<Room[]>(url);
}

export function fetchBookings(estateId?: string): Promise<Booking[]> {
  const url = estateId ? `/bookings?estateId=${estateId}` : '/bookings';
  return request<Booking[]>(url);
}

export function assignRoom(data: AssignRoomRequest): Promise<Booking> {
  return request<Booking>('/bookings/assign', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchAlerts(status?: string): Promise<Alert[]> {
  const url = status ? `/alerts?status=${status}` : '/alerts';
  return request<Alert[]>(url);
}

export function handleAlert(data: HandleAlertRequest): Promise<Alert> {
  return request<Alert>(`/alerts/${data.id}/handle`, {
    method: 'POST',
    body: JSON.stringify({ handlerId: data.handlerId, note: data.note }),
  });
}

export function resolveAlert(id: string): Promise<Alert> {
  return request<Alert>(`/alerts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolvedAt: new Date().toISOString() }),
  });
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/dashboard/summary');
}

export function fetchTimeline(): Promise<TimelineEvent[]> {
  return Promise.resolve(mockTimeline);
}

export function connectWS(): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  try {
    return new WebSocket(wsUrl);
  } catch {
    return {
      readyState: WebSocket.CLOSED,
      addEventListener: () => {},
      removeEventListener: () => {},
      send: () => {},
      close: () => {},
    } as unknown as WebSocket;
  }
}
