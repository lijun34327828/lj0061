import { useEffect, useMemo, useState } from 'react';
import {
  BedDouble,
  Castle,
  Filter,
  User,
  Calendar,
  GripVertical,
  Check,
  Users,
  Sparkles,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { fetchEstates, fetchRooms, fetchBookings, assignRoom } from '@/api';
import type { Estate, Room, Booking, RoomStatus, RoomType } from '@/types';
import { cn } from '@/lib/utils';

const statusOptions: { value: RoomStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部房态' },
  { value: 'vacant', label: '空置' },
  { value: 'occupied', label: '入住' },
  { value: 'cleaning', label: '清洁中' },
  { value: 'maintenance', label: '维修' },
];

const statusConfig: Record<RoomStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  vacant: { label: '空置', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400' },
  occupied: { label: '入住', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/40', dot: 'bg-blue-400' },
  cleaning: { label: '清洁中', bg: 'bg-alert-low/15', text: 'text-alert-low', border: 'border-alert-low/40', dot: 'bg-alert-low' },
  maintenance: { label: '维修', bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/40', dot: 'bg-gray-400' },
};

const typeLabelMap: Record<RoomType, string> = {
  standard: '标准房',
  deluxe: '豪华房',
  suite: '套房',
  presidential: '总统套房',
};

const bookingStatusMap: Record<string, { label: string; className: string }> = {
  pending: { label: '待分配', className: 'bg-alert-medium/15 text-alert-medium border-alert-medium/30' },
  confirmed: { label: '已确认', className: 'bg-gold-500/15 text-gold-400 border-gold-500/30' },
  checked_in: { label: '已入住', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  checked_out: { label: '已退房', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
  cancelled: { label: '已取消', className: 'bg-alert-high/15 text-alert-high border-alert-high/30' },
};

export default function RoomDispatch() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [selectedEstate, setSelectedEstate] = useState<string>('estate-1');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [dragBookingId, setDragBookingId] = useState<string | null>(null);
  const [dragBooking, setDragBooking] = useState<Booking | null>(null);
  const [assignedMap, setAssignedMap] = useState<Record<string, string>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const load = async () => {
      const [e, r, b] = await Promise.all([
        fetchEstates(),
        fetchRooms(selectedEstate),
        fetchBookings(selectedEstate),
      ]);
      setEstates(e);
      setRooms(r);
      setBookings(b);
    };
    load();
  }, [selectedEstate]);

  const floors = useMemo(() => {
    const floorMap: Record<number, Room[]> = {};
    rooms
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .forEach((r) => {
        if (!floorMap[r.floor]) floorMap[r.floor] = [];
        floorMap[r.floor].push(r);
      });
    return Object.entries(floorMap)
      .map(([floor, rs]) => ({ floor: Number(floor), rooms: rs.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)) }))
      .sort((a, b) => a.floor - b.floor);
  }, [rooms, statusFilter]);

  const pendingBookings = bookings.filter((b) => !b.roomId && !assignedMap[b.id]);

  const handleDragStart = (e: DragStartEvent) => {
    const id = e.active.id as string;
    if (id.startsWith('booking-')) {
      const bid = id.replace('booking-', '');
      const booking = bookings.find((b) => b.id === bid);
      setDragBookingId(id);
      setDragBooking(booking || null);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (dragBooking && over) {
      const overId = over.id as string;
      if (overId.startsWith('room-')) {
        const roomId = overId.replace('room-', '');
        const room = rooms.find((r) => r.id === roomId);
        if (room && room.status === 'vacant') {
          setAssignedMap((prev) => ({ ...prev, [dragBooking.id]: roomId }));
          assignRoom({ bookingId: dragBooking.id, roomId }).catch(() => {});
        }
      }
    }
    setDragBookingId(null);
    setDragBooking(null);
  };

  const totalByStatus = {
    vacant: rooms.filter((r) => r.status === 'vacant').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    cleaning: rooms.filter((r) => r.status === 'cleaning').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6 animate-float-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl gold-text mb-1">客房调度系统</h2>
          <p className="text-sm text-gray-500">Room Dispatch & Assignment System</p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {(['vacant', 'occupied', 'cleaning', 'maintenance'] as RoomStatus[]).map((st) => {
            const cfg = statusConfig[st];
            return (
              <div key={st} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                    <span className={cn('text-xs font-medium', cfg.text)}>{cfg.label}</span>
                  </div>
                  <BedDouble className={cn('w-4 h-4 opacity-40', cfg.text)} />
                </div>
                <div className={cn('font-display font-black text-3xl', cfg.text)}>{totalByStatus[st]}</div>
                <div className="text-[11px] text-gray-500 mt-1">共 {rooms.length} 间</div>
              </div>
            );
          })}
        </div>

        <div className="glass-card p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Castle className="w-4 h-4 text-gold-400" />
              <select
                value={selectedEstate}
                onChange={(e) => setSelectedEstate(e.target.value)}
                className="input-field text-sm w-52"
              >
                {estates.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RoomStatus | 'all')}
                className="input-field text-sm w-40"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto text-xs text-gray-500">
              <span className="text-gold-400 font-medium">{pendingBookings.length}</span> 个预订待分配
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg gold-text">楼层房态图</h3>
              <div className="flex items-center gap-3 text-xs">
                {Object.entries(statusConfig).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div className={cn('w-2.5 h-2.5 rounded-full', v.dot)} />
                    <span className="text-gray-500">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5 max-h-[560px] overflow-y-auto scrollbar-thin pr-2">
              {floors.length === 0 ? (
                <div className="text-center py-16 text-gray-500">暂无符合条件的客房</div>
              ) : (
                floors.map(({ floor, rooms: floorRooms }) => (
                  <div key={floor} className="relative">
                    <div className="sticky top-0 z-10 flex items-center gap-3 mb-3 py-1 bg-imperial-800/80 backdrop-blur">
                      <div className="flex items-center justify-center w-12 h-8 rounded-lg bg-gold-500/15 border border-gold-500/30">
                        <span className="text-xs font-bold gold-text">{floor}F</span>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-gold-500/30 to-transparent" />
                      <span className="text-xs text-gray-500">{floorRooms.length} 间房</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pl-1">
                      {floorRooms.map((room) => {
                        const cfg = statusConfig[room.status];
                        const assignedBookingId = Object.entries(assignedMap).find(([, rid]) => rid === room.id)?.[0];
                        const assignedBooking = assignedBookingId ? bookings.find((b) => b.id === assignedBookingId) : null;
                        const isHovered = hoveredRoom === room.id;
                        const canDrop = room.status === 'vacant';

                        return (
                          <div
                            key={room.id}
                            id={`room-${room.id}`}
                            data-room="true"
                            onMouseEnter={() => setHoveredRoom(room.id)}
                            onMouseLeave={() => setHoveredRoom(null)}
                            className={cn(
                              'relative p-3 rounded-xl border transition-all duration-200',
                              cfg.bg,
                              cfg.border,
                              isHovered && canDrop && 'ring-2 ring-gold-500/50 scale-[1.02] shadow-gold-glow',
                              canDrop && 'cursor-pointer hover:brightness-110',
                              !canDrop && 'opacity-70',
                            )}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={cn('text-sm font-bold', cfg.text)}>{room.roomNumber}</span>
                              <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                            </div>
                            <div className="text-[10px] text-gray-500 mb-1">{typeLabelMap[room.type]}</div>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded', cfg.bg, cfg.border, cfg.text)}>
                                {cfg.label}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                <Users className="w-2.5 h-2.5 inline mr-0.5 opacity-60" />{room.capacity}
                              </span>
                            </div>

                            {assignedBooking && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-[10px] text-emerald-400 truncate">{assignedBooking.guestName}</span>
                                </div>
                              </div>
                            )}

                            {isHovered && (
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-30 w-44 glass-card p-2.5 text-[11px] pointer-events-none animate-slide-in">
                                <div className="font-medium text-gray-100 mb-1">房号 {room.roomNumber}</div>
                                <div className="space-y-0.5 text-gray-400">
                                  <div>类型：{typeLabelMap[room.type]}</div>
                                  <div>容纳：{room.capacity}人</div>
                                  <div>价格：¥{room.pricePerNight.toLocaleString()}/晚</div>
                                  {room.lastCleaned && <div>上次清洁：{room.lastCleaned}</div>}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-5 h-fit sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-400" />
                <h3 className="font-display font-bold gold-text">入住安排</h3>
              </div>
              <span className="text-[10px] text-gray-500">拖拽分配</span>
            </div>

            <p className="text-[11px] text-gray-500 mb-4">将预订拖到左侧可用客房完成分配</p>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto scrollbar-thin pr-1">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <div className="text-sm">暂无待分配预订</div>
                </div>
              ) : (
                pendingBookings.map((b) => {
                  const statusInfo = bookingStatusMap[b.status] || bookingStatusMap.pending;
                  const nights = Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (24 * 3600 * 1000));

                  return (
                    <div
                      key={b.id}
                      id={`booking-${b.id}`}
                      data-booking="true"
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold-500/40 hover:bg-gold-500/5 cursor-grab active:cursor-grabbing transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center pt-0.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 shadow-gold-glow">
                            <User className="w-4 h-4 text-imperial-900" />
                          </div>
                          <GripVertical className="w-3.5 h-3.5 mt-1 text-gray-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-100 truncate">{b.guestName}</span>
                            <span className={cn('text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0', statusInfo.className)}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{b.checkIn.slice(5)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" />
                              <span>{b.guests}人 · {nights}晚</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                              {typeLabelMap[b.roomType]}
                            </span>
                            <span className="text-xs gold-text font-bold">¥{(b.totalPrice / 10000).toFixed(1)}万</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {dragBooking ? (
            <div className="p-3 rounded-xl shadow-2xl bg-imperial-800/95 backdrop-blur-xl border border-gold-500/50 shadow-gold-glow cursor-grabbing min-w-[240px]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-imperial-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-100 truncate">{dragBooking.guestName}</div>
                  <div className="text-[10px] text-gray-500">
                    {dragBooking.checkIn.slice(5)} ~ {dragBooking.checkOut.slice(5)} · {typeLabelMap[dragBooking.roomType]}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
