import { useEffect, useState } from 'react';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  User,
  Filter,
  ArrowRightLeft,
  GripVertical,
  Sun,
  Sunset,
  Moon,
  Castle,
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
  type DragOverEvent,
} from '@dnd-kit/core';
import { fetchEstates, fetchEstateStaff, fetchSchedules, updateSchedule, transferStaff } from '@/api';
import type { Estate, Staff, ScheduleShift, ShiftType, StaffRole } from '@/types';
import { cn } from '@/lib/utils';

const roleOptions: { value: StaffRole | 'all'; label: string }[] = [
  { value: 'all', label: '全部角色' },
  { value: 'butler', label: '管家' },
  { value: 'security', label: '安保' },
  { value: 'logistics', label: '后勤' },
  { value: 'chef', label: '主厨' },
  { value: 'gardener', label: '园艺师' },
  { value: 'driver', label: '司机' },
];

const shiftConfig: Record<ShiftType, { label: string; icon: typeof Sun; gradient: string; border: string; text: string }> = {
  morning: {
    label: '早班',
    icon: Sun,
    gradient: 'from-amber-400/20 to-orange-400/10',
    border: 'border-amber-400/30',
    text: 'text-amber-300',
  },
  afternoon: {
    label: '中班',
    icon: Sunset,
    gradient: 'from-purple-400/20 to-rose-400/10',
    border: 'border-purple-400/30',
    text: 'text-purple-300',
  },
  night: {
    label: '晚班',
    icon: Moon,
    gradient: 'from-blue-400/20 to-indigo-400/10',
    border: 'border-blue-400/30',
    text: 'text-blue-300',
  },
};

const roleLabelMap: Record<string, string> = {
  butler: '管家', security: '安保', logistics: '后勤',
  chef: '主厨', gardener: '园艺师', driver: '司机',
};

function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDateDisplay(d: Date): { day: string; weekday: string } {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return {
    day: `${d.getMonth() + 1}/${d.getDate()}`,
    weekday: weekdays[d.getDay()],
  };
}

export default function Scheduling() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [selectedEstate, setSelectedEstate] = useState<string>('estate-1');
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<ScheduleShift[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(new Date('2026-06-16'));
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragShift, setDragShift] = useState<ScheduleShift | null>(null);

  const [transferableStaff, setTransferableStaff] = useState<Staff[]>([]);
  const [dragStaffId, setDragStaffId] = useState<string | null>(null);
  const [dragStaff, setDragStaff] = useState<Staff | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const weekDates = getWeekDates(weekStart);

  useEffect(() => {
    const load = async () => {
      const [e, s, sch] = await Promise.all([
        fetchEstates(),
        fetchEstateStaff(selectedEstate),
        fetchSchedules(selectedEstate),
      ]);
      setEstates(e);
      setStaff(s);
      setShifts(sch.shifts || []);
      setTransferableStaff(s.slice(0, 3).map((st) => ({ ...st, estateId: 'transfer', estateName: '待调配' })));
    };
    load();
  }, [selectedEstate]);

  const filteredStaff = roleFilter === 'all' ? staff : staff.filter((s) => s.role === roleFilter);

  const getShiftAt = (staffId: string, dateKey: string, shiftType: ShiftType) =>
    shifts.find((s) => s.staffId === staffId && s.date === dateKey && s.shift === shiftType);

  const handleShiftDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    if (id.startsWith('shift-')) {
      const parts = id.replace('shift-', '').split('-');
      const shift = shifts.find((s) => s.id === parts[0]);
      setDragId(id);
      setDragShift(shift || null);
    } else if (id.startsWith('staff-transfer-')) {
      const sid = id.replace('staff-transfer-', '');
      const s = transferableStaff.find((st) => st.id === sid);
      setDragStaffId(id);
      setDragStaff(s || null);
    }
  };

  const handleShiftDragOver = (_event: DragOverEvent) => {
    // placeholder
  };

  const handleShiftDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (dragShift && over) {
      const overId = over.id as string;
      if (overId.startsWith('slot-')) {
        const [, staffId, dateKey, shiftType] = overId.split('-');
        const newShift: ScheduleShift = {
          ...dragShift,
          staffId,
          date: dateKey,
          shift: shiftType as ShiftType,
        };
        setShifts((prev) => [
          ...prev.filter((s) => s.id !== dragShift.id),
          { ...newShift, id: dragShift.id },
        ]);
        updateSchedule(newShift).catch(() => {});
      }
    }
    if (dragStaff && over) {
      const overId = over.id as string;
      if (overId.startsWith('estate-')) {
        const estateId = overId.replace('estate-', '');
        const targetEstate = estates.find((e) => e.id === estateId);
        if (targetEstate) {
          transferStaff({
            staffId: dragStaff.id,
            fromEstateId: dragStaff.estateId,
            toEstateId: estateId,
            startDate: formatDateKey(new Date()),
            endDate: formatDateKey(new Date(Date.now() + 7 * 24 * 3600 * 1000)),
            reason: '紧急调配',
          }).catch(() => {});
          setTransferableStaff((prev) => prev.filter((s) => s.id !== dragStaff.id));
        }
      }
    }
    setDragId(null);
    setDragShift(null);
    setDragStaffId(null);
    setDragStaff(null);
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const today = formatDateKey(new Date());

  return (
    <div className="space-y-6 animate-float-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl gold-text mb-1">排班管理中心</h2>
          <p className="text-sm text-gray-500">Staff Scheduling Management Center</p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleShiftDragStart}
        onDragOver={handleShiftDragOver}
        onDragEnd={handleShiftDragEnd}
      >
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <div className="xl:col-span-3 space-y-5">
            <div className="glass-card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Castle className="w-4 h-4 text-gold-400" />
                  <select
                    value={selectedEstate}
                    onChange={(e) => setSelectedEstate(e.target.value)}
                    className="input-field text-sm w-48"
                  >
                    {estates.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gold-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as StaffRole | 'all')}
                    className="input-field text-sm w-36"
                  >
                    {roleOptions.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="ml-auto flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                  <button onClick={prevWeek} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 px-3">
                    <CalendarClock className="w-4 h-4 text-gold-400" />
                    <span className="text-sm font-medium text-gray-100">
                      {formatDateDisplay(weekDates[0]).day} - {formatDateDisplay(weekDates[6]).day}
                    </span>
                  </div>
                  <button onClick={nextWeek} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b border-white/10 w-44 sticky left-0 bg-imperial-900/80 backdrop-blur z-10">
                      <div className="text-xs text-gray-500 mb-1">员工 / 日期</div>
                      <div className="text-sm text-gray-100">共 {filteredStaff.length} 人</div>
                    </th>
                    {weekDates.map((d) => {
                      const disp = formatDateDisplay(d);
                      const isToday = formatDateKey(d) === today;
                      return (
                        <th
                          key={d.toISOString()}
                          className={cn(
                            'p-3 border-b border-white/10 min-w-[120px]',
                            isToday && 'bg-gold-500/5',
                          )}
                        >
                          <div className={cn('text-[10px] mb-0.5', isToday ? 'text-gold-400 font-medium' : 'text-gray-500')}>{disp.weekday}</div>
                          <div className={cn('text-sm font-medium', isToday ? 'gold-text' : 'text-gray-100')}>{disp.day}</div>
                          {isToday && <div className="text-[10px] text-gold-400 mt-0.5">今日</div>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 border-b border-white/5 sticky left-0 bg-imperial-900/80 backdrop-blur z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-imperial-900 font-bold text-sm flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-100 truncate">{s.name}</div>
                            <div className="text-[11px] text-gold-400/80">{roleLabelMap[s.role] || s.role}</div>
                          </div>
                        </div>
                      </td>
                      {weekDates.map((d) => {
                        const dateKey = formatDateKey(d);
                        return (
                          <td key={dateKey} className="p-2 border-b border-white/5 align-top">
                            <div className="space-y-1.5">
                              {(['morning', 'afternoon', 'night'] as ShiftType[]).map((st) => {
                                const config = shiftConfig[st];
                                const shift = getShiftAt(s.id, dateKey, st);
                                const SlotIcon = config.icon;
                                const slotId = `slot-${s.id}-${dateKey}-${st}`;

                                return (
                                  <div
                                    key={st}
                                    id={slotId}
                                    data-slot="true"
                                    className={cn(
                                      'relative p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200',
                                      shift
                                        ? `bg-gradient-to-br ${config.gradient} border ${config.border}`
                                        : 'border border-dashed border-white/10 hover:border-gold-500/30 hover:bg-white/[0.02] min-h-[44px]',
                                    )}
                                  >
                                    {shift ? (
                                      <div
                                        id={`shift-${shift.id}`}
                                        data-shift="true"
                                        className="flex items-center gap-1.5"
                                      >
                                        <GripVertical className="w-3 h-3 text-gray-500 flex-shrink-0 opacity-60" />
                                        <SlotIcon className={cn('w-3 h-3 flex-shrink-0', config.text)} />
                                        <span className={cn('text-[11px] font-medium flex-1 truncate', config.text)}>
                                          {config.label}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 opacity-30">
                                        <SlotIcon className="w-3 h-3 flex-shrink-0 text-gray-500" />
                                        <span className="text-[11px] text-gray-500">{config.label}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-5 h-fit sticky top-0">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightLeft className="w-4 h-4 text-gold-400" />
              <h4 className="font-display font-bold gold-text">跨区域调配</h4>
            </div>

            <p className="text-[11px] text-gray-500 mb-4">拖拽待调配人员到目标庄园</p>

            <div className="mb-5">
              <div className="text-xs text-gray-500 mb-2">待调配人员 ({transferableStaff.length})</div>
              <div className="space-y-2">
                {transferableStaff.map((st) => (
                  <div
                    key={st.id}
                    id={`staff-transfer-${st.id}`}
                    data-transferable="true"
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold-500/30 hover:bg-white/5 cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-imperial-900 font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <GripVertical className="absolute -right-1 -bottom-1 w-3.5 h-3.5 text-gray-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-100 truncate">{st.name}</div>
                        <div className="text-[10px] text-gold-400/80">{roleLabelMap[st.role] || st.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">目标庄园</div>
              <div className="space-y-2">
                {estates.filter((e) => e.id !== selectedEstate).slice(0, 4).map((e) => (
                  <div
                    key={e.id}
                    id={`estate-${e.id}`}
                    data-estate="true"
                    className="p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/10 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                        <Castle className="w-4 h-4 text-gold-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-100 truncate">{e.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{e.location?.city}, {e.location?.country}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DragOverlay>
          {dragShift ? (
            <div className="p-2 rounded-xl shadow-2xl bg-imperial-800/90 backdrop-blur border border-gold-500/50 shadow-gold-glow cursor-grabbing">
              <div className="flex items-center gap-2 text-xs text-gold-400 font-medium">
                {shiftConfig[dragShift.shift]?.label || '班次'} · {dragShift.staffName || '未命名'}
              </div>
            </div>
          ) : dragStaff ? (
            <div className="p-2.5 rounded-xl shadow-2xl bg-imperial-800/90 backdrop-blur border border-gold-500/50 shadow-gold-glow cursor-grabbing">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-imperial-900 text-xs font-bold">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-xs text-gray-100 font-medium">{dragStaff.name || '未命名'}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
