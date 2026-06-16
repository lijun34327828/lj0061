import type { Estate, Staff, Schedule, Room, Booking, Alert, ZoneType } from '../types/index.js'

const estateNames = [
  { id: 'estate-1', name: 'Château Lavande', country: '法国', city: '普罗旺斯', lat: 43.5297, lng: 5.4474, colors: ['#D946EF', '#A855F7', '#8B5CF6', '#7C3AED', '#6366F1'] },
  { id: 'estate-2', name: 'Pacific Heights Manor', country: '美国', city: '加州', lat: 36.7783, lng: -119.4179, colors: ['#F97316', '#FB923C', '#F59E0B', '#EAB308', '#FACC15'] },
  { id: 'estate-3', name: 'Alpine Chalet Royal', country: '瑞士', city: '阿尔卑斯', lat: 46.5197, lng: 7.9586, colors: ['#06B6D4', '#22D3EE', '#0EA5E9', '#3B82F6', '#60A5FA'] },
  { id: 'estate-4', name: '京都嵐山御苑', country: '日本', city: '京都', lat: 35.0116, lng: 135.7681, colors: ['#EC4899', '#F472B6', '#F43F5E', '#EF4444', '#DC2626'] },
  { id: 'estate-5', name: 'Maldives Paradise Resort', country: '马尔代夫', city: '马累', lat: 4.1755, lng: 73.5093, colors: ['#10B981', '#34D399', '#14B8A6', '#2DD4BF', '#22D3EE'] }
]

const zoneConfigs: { type: ZoneType; name: string }[] = [
  { type: 'main_building', name: '主楼' },
  { type: 'guest_room', name: '客房区' },
  { type: 'exhibition', name: '展览厅' },
  { type: 'horse_farm', name: '马场' },
  { type: 'marina', name: '码头' }
]

const generateZones = (estateId: string, colors: string[]) => {
  const boundsConfigs = [
    { x: 10, y: 10, width: 35, height: 30 },
    { x: 50, y: 10, width: 40, height: 25 },
    { x: 10, y: 45, width: 30, height: 25 },
    { x: 45, y: 40, width: 45, height: 30 },
    { x: 15, y: 75, width: 70, height: 15 }
  ]
  return zoneConfigs.map((zone, idx) => ({
    id: `${estateId}-zone-${idx + 1}`,
    type: zone.type,
    name: zone.name,
    bounds: boundsConfigs[idx],
    color: colors[idx],
    status: {
      healthScore: Math.floor(Math.random() * 30) + 70,
      alertCount: Math.floor(Math.random() * 5)
    },
    onDutyStaff: []
  }))
}

const generateReceptions = (estateId: string, estateName: string) => {
  const guestNames = ['张伟', '李娜', '王强', '刘洋', '陈静']
  const types = ['VIP接待', '商务宴请', '私人聚会', '婚礼庆典', '生日派对']
  const statuses = ['scheduled', 'in_progress', 'completed']
  return guestNames.map((name, idx) => ({
    id: `${estateId}-reception-${idx + 1}`,
    guestName: name,
    time: `2026-06-17 ${String(9 + idx * 2).padStart(2, '0')}:00`,
    estateId,
    estateName,
    type: types[idx],
    status: statuses[idx % 3]
  }))
}

export const estates: Estate[] = estateNames.map(e => {
  const zones = generateZones(e.id, e.colors)
  return {
    id: e.id,
    name: e.name,
    location: {
      country: e.country,
      city: e.city,
      lat: e.lat,
      lng: e.lng
    },
    zones,
    dailyExpense: Math.floor(Math.random() * 50000) + 10000,
    todayReceptions: generateReceptions(e.id, e.name)
  }
})

const butlerNames = ['皮埃尔', '玛丽', '安娜', '让-皮埃尔', '苏菲', '克劳德', '伊莎贝尔', '卢卡斯']
const securityNames = ['迈克', '约翰', '大卫', '詹姆斯', '罗伯特', '威廉', '托马斯', '查理']
const logisticsNames = ['李明', '张华', '王芳', '赵军', '孙丽', '周涛', '吴敏', '郑华']

const avatarBase = 'https://api.dicebear.com/7.x/avataaars/svg?seed='

export const staff: Staff[] = []
estates.forEach(estate => {
  const zones = estate.zones
  const staffCount = 12 + Math.floor(Math.random() * 7)

  for (let i = 0; i < staffCount; i++) {
    const roles = ['butler', 'security', 'logistics'] as const
    const role = roles[i % 3]
    const namePool = role === 'butler' ? butlerNames : role === 'security' ? securityNames : logisticsNames
    const name = namePool[i % namePool.length] + (i > 7 ? String(i) : '')
    const statuses = ['on_duty', 'on_duty', 'on_duty', 'off_duty', 'leave'] as const
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const zone = status === 'on_duty' ? zones[Math.floor(Math.random() * zones.length)] : undefined

    const staffMember: Staff = {
      id: `${estate.id}-staff-${i + 1}`,
      name,
      role,
      estateId: estate.id,
      avatar: `${avatarBase}${encodeURIComponent(name)}`,
      status,
      currentZoneId: zone?.id
    }

    if (zone) {
      zone.onDutyStaff.push(staffMember.id)
    }

    staff.push(staffMember)
  }
})

export const schedules: Schedule[] = []
const shifts = ['morning', 'afternoon', 'night'] as const
const today = new Date(2026, 5, 17)

staff.forEach((staffMember, staffIdx) => {
  for (let day = 0; day < 7; day++) {
    const date = new Date(today)
    date.setDate(date.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]
    const shift = shifts[(staffIdx + day) % 3]
    const zones = estates.find(e => e.id === staffMember.estateId)?.zones || []
    const zone = zones[Math.floor(Math.random() * zones.length)]

    schedules.push({
      id: `${staffMember.id}-schedule-${day}`,
      staffId: staffMember.id,
      estateId: staffMember.estateId,
      date: dateStr,
      shift,
      zoneId: zone.id
    })
  }
})

const roomTypes = ['豪华套房', '行政套房', '总统套房', '园景房', '海景房', '山景房']
const roomStatuses = ['vacant', 'occupied', 'occupied', 'cleaning', 'maintenance', 'occupied'] as const
const guestNamesPool = ['周杰伦', '林志玲', '马云', '马化腾', '李彦宏', '雷军', '王健林', '许家印', '张一鸣', '黄峥', '曾毓群', '李书福']

export const rooms: Room[] = []
estates.forEach(estate => {
  const roomCount = 8 + Math.floor(Math.random() * 5)
  const floors = 2 + Math.floor(Math.random() * 2)

  for (let i = 0; i < roomCount; i++) {
    const floor = (i % floors) + 1
    const roomNo = `${floor}${String((i % 10) + 1).padStart(2, '0')}`
    const status = roomStatuses[i % roomStatuses.length]
    const hasGuest = status === 'occupied'
    const guestName = guestNamesPool[(i + estates.indexOf(estate)) % guestNamesPool.length]

    rooms.push({
      id: `${estate.id}-room-${i + 1}`,
      estateId: estate.id,
      floor,
      roomNo,
      type: roomTypes[i % roomTypes.length],
      status,
      currentGuest: hasGuest ? {
        name: guestName,
        avatar: `${avatarBase}${encodeURIComponent(guestName)}`
      } : undefined
    })
  }
})

export const bookings: Booking[] = []
const bookingStatuses = ['pending', 'checked_in', 'checked_out', 'pending', 'checked_in'] as const
rooms.forEach((room, idx) => {
  if (idx % 2 === 0 || room.status === 'occupied') {
    const checkIn = new Date(today)
    checkIn.setDate(checkIn.getDate() - (idx % 3))
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 3 + (idx % 4))
    const guestName = room.currentGuest?.name || guestNamesPool[idx % guestNamesPool.length]

    bookings.push({
      id: `booking-${idx + 1}`,
      guestName,
      guestAvatar: `${avatarBase}${encodeURIComponent(guestName)}`,
      roomId: room.status === 'occupied' ? room.id : undefined,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      status: bookingStatuses[idx % bookingStatuses.length]
    })
  }
})

const alertTitles = {
  facility_damage: ['中央空调故障', '电梯停运', '照明系统异常', '给排水管道漏水', '消防报警误报'],
  supply_shortage: ['红酒库存不足', '清洁用品短缺', '餐具破损需补充', '布草存量告急', '食材库存预警'],
  staff_abnormal: ['安保人员未到岗', '管家请假未报备', '后勤人员工作异常', '值班人员脱岗', '交接班记录缺失']
}

const alertDescriptions = {
  facility_damage: [
    '三楼东翼中央空调制冷效果异常，已影响3间客房。',
    'B栋观光电梯停运，维修人员已前往排查。',
    '花园景观照明部分灯具不亮，影响夜间游览。',
    '厨房主供水管道接口渗漏，正在紧急维修。',
    '主楼消防报警器触发，经确认为误报。'
  ],
  supply_shortage: [
    '法国波尔多产区红酒库存仅剩20瓶，低于安全库存。',
    '多功能清洁剂库存不足3天用量，需紧急采购。',
    'VIP宴会专用餐具破损率超标，需要补充30套。',
    '客房布草周转量不足，建议立即补充采购。',
    '日式料理食材库存低于警戒线，影响今日预定。'
  ],
  staff_abnormal: [
    '东门岗安保人员未按时到岗，已联系替班。',
    '首席管家皮埃尔请假未提交书面申请。',
    '物流组张华工作状态异常，建议主管关注。',
    '夜间值班主管离岗超过2小时，未报备。',
    '早班交接缺失3项重要记录，需要补全。'
  ]
}

const priorities = ['high', 'medium', 'low', 'medium', 'high'] as const

export const alerts: Alert[] = []
estates.forEach((estate, estateIdx) => {
  const types = ['facility_damage', 'supply_shortage', 'staff_abnormal'] as const
  types.forEach((type, typeIdx) => {
    for (let i = 0; i < 2; i++) {
      const zoneIdx = (typeIdx + i + estateIdx) % estate.zones.length
      const createdAt = new Date(today)
      createdAt.setHours(8 + (typeIdx * 3 + i * 2) % 12, (i * 17 + typeIdx * 31) % 60)
      const alertIndex = (estateIdx * 3 + typeIdx * 2 + i) % alertTitles[type].length

      alerts.push({
        id: `alert-${estateIdx + 1}-${type}-${i + 1}`,
        estateId: estate.id,
        zoneId: estate.zones[zoneIdx].id,
        type,
        priority: priorities[(estateIdx + typeIdx + i) % priorities.length],
        title: alertTitles[type][alertIndex],
        description: alertDescriptions[type][alertIndex],
        createdAt: createdAt.toISOString(),
        status: i === 0 ? 'pending' : (i === 1 ? 'handling' : 'resolved'),
        handlerId: i > 0 ? staff.find(s => s.estateId === estate.id)?.id : undefined
      })
    }
  })
})
