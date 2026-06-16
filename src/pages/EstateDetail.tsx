import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  BedDouble,
  Percent,
  Activity,
  User,
  ShieldCheck,
  Clock,
  Heart,
  AlertTriangle,
  Building2,
  Home,
  Palette,
  TreeDeciduous,
  Anchor,
} from 'lucide-react';
import AlertBadge from '@/components/AlertBadge';
import { fetchEstateById, fetchEstateStaff } from '@/api';
import type { Estate, EstateZone, Staff } from '@/types';
import { cn } from '@/lib/utils';

const zoneIconMap: Record<string, typeof Building2> = {
  main: Building2,
  main_building: Building2,
  guest: Home,
  guest_room: Home,
  exhibition: Palette,
  horse: TreeDeciduous,
  horse_farm: TreeDeciduous,
  marina: Anchor,
};

const zoneColorMap: Record<string, string> = {
  main: '#c9a962',
  main_building: '#c9a962',
  guest: '#e8d5b7',
  guest_room: '#e8d5b7',
  exhibition: '#722f37',
  horse: '#3d5a45',
  horse_farm: '#3d5a45',
  marina: '#2e5e8b',
};

const zoneClassMap: Record<string, string> = {
  main: 'zone-main',
  main_building: 'zone-main',
  guest: 'zone-guest',
  guest_room: 'zone-guest',
  exhibition: 'zone-exhibition',
  horse: 'zone-horse',
  horse_farm: 'zone-horse',
  marina: 'zone-marina',
};

const roleLabelMap: Record<string, string> = {
  butler: '管家',
  security: '安保',
  logistics: '后勤',
  chef: '主厨',
  gardener: '园艺师',
  driver: '司机',
};

const statusLabelMap: Record<string, { label: string; className: string }> = {
  on_duty: { label: '在岗', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30' },
  off_duty: { label: '休息', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
  leave: { label: '休假', className: 'bg-alert-medium/15 text-alert-medium border-alert-medium/30' },
  training: { label: '培训', className: 'bg-gold-500/15 text-gold-400 border-gold-500/30' },
};

function HealthRing({ value, size = 120, color = '#c9a962' }: { value?: number; size?: number; color?: string }) {
  const safeValue = value ?? 0;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`ring-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.9} />
            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${color})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-black text-2xl gold-text">{safeValue}</span>
        <span className="text-[10px] text-gray-500">健康度</span>
      </div>
    </div>
  );
}

function AvatarGroup({ staff, max = 5 }: { staff: Staff[]; max?: number }) {
  const display = staff.slice(0, max);
  const extra = staff.length - max;
  return (
    <div className="flex -space-x-2">
      {display.map((s) => (
        <div
          key={s.id}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 border-2 border-imperial-800 flex items-center justify-center text-imperial-900 text-xs font-bold"
          title={s.name}
        >
          {s.name.slice(0, 1)}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-imperial-800 flex items-center justify-center text-gray-300 text-xs font-medium">
          +{extra}
        </div>
      )}
    </div>
  );
}

export default function EstateDetail() {
  const { id } = useParams<{ id: string }>();
  const [estate, setEstate] = useState<Estate | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedZone, setSelectedZone] = useState<EstateZone | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [e, s] = await Promise.all([fetchEstateById(id), fetchEstateStaff(id)]);
      const normalizedEstate = {
        ...e,
        zones: (e.zones || []).map((zone) => ({
          ...zone,
          health: zone.status?.healthScore ?? zone.health ?? 0,
          alerts: zone.status?.alertCount ?? zone.alerts ?? 0,
        })),
      };
      setEstate(normalizedEstate);
      setStaff(s);
      if (normalizedEstate.zones && normalizedEstate.zones.length > 0) {
        setSelectedZone(normalizedEstate.zones[0]);
      }
    };
    load();
  }, [id]);

  if (!estate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-float-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-gold-500/30 transition-all group">
            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-gold-400" />
          </Link>
          <div>
            <h2 className="font-display font-bold text-2xl gold-text mb-1">{estate.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>{estate.location?.city}, {estate.location?.country}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">正常运营</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Users, label: '员工总数', value: estate.staffCount, sub: `${staff.filter(s => s.status === 'on_duty').length}人在岗` },
          { icon: BedDouble, label: '客房数量', value: estate.roomCount, sub: `${estate.occupancyRate}% 入住率` },
          { icon: Percent, label: '入住率', value: `${estate.occupancyRate}%`, sub: '较昨日 +2.3%' },
          { icon: Activity, label: '今日开销', value: `¥${(estate.todayExpense / 10000).toFixed(1)}万`, sub: '预算内' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-gold-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="font-display font-bold text-xl gold-text">{s.value}</div>
              </div>
            </div>
            <div className="text-[11px] text-gray-500 mt-2 pl-12">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-lg gold-text">庄园平面总览</h3>
            <div className="flex items-center gap-3 text-xs">
              {Object.entries(zoneColorMap).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: v, opacity: 0.6 }} />
                  <span className="text-gray-500">
                    {k === 'main' ? '主楼' : k === 'guest' ? '客房' : k === 'exhibition' ? '展厅' : k === 'horse' ? '马场' : '码头'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full h-[420px] rounded-xl bg-imperial-900/40 border border-white/5 overflow-hidden">
            <svg viewBox="0 0 700 450" className="w-full h-full">
              <defs>
                <pattern id="estateGrid" width="35" height="35" patternUnits="userSpaceOnUse">
                  <path d="M 35 0 L 0 0 0 35" fill="none" stroke="rgba(201,169,98,0.08)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="700" height="450" fill="url(#estateGrid)" rx="12" />

              <g stroke="#c9a962" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4" fill="none">
                <path d="M 50 225 Q 200 200 350 225 T 650 225" />
                <path d="M 350 50 Q 325 150 350 225 T 350 400" />
              </g>

              {estate.zones.map((zone) => {
                const isHovered = hoveredZone === zone.id;
                const isSelected = selectedZone?.id === zone.id;
                const color = zoneColorMap[zone.type];
                const Icon = zoneIconMap[zone.type];

                return (
                  <g
                    key={zone.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <rect
                      x={zone.bounds.x}
                      y={zone.bounds.y}
                      width={zone.bounds.width}
                      height={zone.bounds.height}
                      rx="12"
                      fill={color}
                      fillOpacity={isSelected ? 0.4 : isHovered ? 0.3 : 0.18}
                      stroke={color}
                      strokeOpacity={isSelected ? 1 : isHovered ? 0.8 : 0.4}
                      strokeWidth={isSelected ? 2 : 1}
                      className="transition-all duration-300"
                    />
                    <foreignObject
                      x={zone.bounds.x + 10}
                      y={zone.bounds.y + 10}
                      width="28"
                      height="28"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}50` }}>
                        <Icon style={{ color, width: 14, height: 14 }} />
                      </div>
                    </foreignObject>
                    <text
                      x={zone.bounds.x + zone.bounds.width / 2}
                      y={zone.bounds.y + zone.bounds.height / 2 + 4}
                      textAnchor="middle"
                      fill={isSelected || isHovered ? '#fff' : '#9ca3af'}
                      fontSize="13"
                      fontWeight={isSelected ? 600 : 500}
                      className="pointer-events-none select-none"
                    >
                      {zone.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredZone && (() => {
              const z = estate.zones.find((zz) => zz.id === hoveredZone);
              if (!z) return null;
              return (
                <div
                  className="absolute glass-card p-3 z-20 pointer-events-none animate-slide-in min-w-[180px]"
                  style={{ left: Math.min(z.bounds.x + 40, 450), top: Math.max(z.bounds.y - 20, 10) }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${zoneColorMap[z.type]}40` }}>
                      {(() => { const I = zoneIconMap[z.type]; return <I style={{ color: zoneColorMap[z.type], width: 12, height: 12 }} />; })()}
                    </div>
                    <span className="font-medium text-sm text-gray-100">{z.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                    <div><div className="font-bold" style={{ color: zoneColorMap[z.type] }}>{z.health}%</div><div className="text-gray-500">健康</div></div>
                    <div><div className="font-bold text-gray-100">{z.staffCount}</div><div className="text-gray-500">员工</div></div>
                    <div><div className={`font-bold ${z.alerts > 0 ? 'text-alert-high' : 'text-emerald-400'}`}>{z.alerts}</div><div className="text-gray-500">告警</div></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-bold gold-text">区域详情</h4>
              {selectedZone && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${zoneColorMap[selectedZone.type]}25`, color: zoneColorMap[selectedZone.type] }}>{selectedZone.name}</span>}
            </div>

            {selectedZone ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <HealthRing value={selectedZone.health} color={zoneColorMap[selectedZone.type]} />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[11px] text-gray-500 mb-1">区域说明</div>
                  <p className="text-xs text-gray-300 leading-relaxed">{selectedZone.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">在岗人员</span>
                    <span className="text-xs text-gold-400 font-medium">{selectedZone.staffCount}人</span>
                  </div>
                  <AvatarGroup staff={staff.slice(0, 8)} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-alert-medium" />
                      <span className="text-xs text-gray-500">当前告警</span>
                    </div>
                    <AlertBadge priority={selectedZone.alerts > 1 ? 'high' : selectedZone.alerts > 0 ? 'medium' : 'low'} showLabel={false} size="sm" />
                  </div>
                  {selectedZone.alerts > 0 ? (
                    <div className="space-y-1.5">
                      {Array.from({ length: selectedZone.alerts }).map((_, i) => (
                        <div key={i} className="p-2 rounded-lg bg-alert-high/5 border border-alert-high/10 text-xs text-gray-300">
                          <div className="flex items-center gap-2">
                            <AlertBadge priority="medium" showLabel={false} size="sm" />
                            <span>设施告警 #{i + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 text-xs text-gray-500">暂无告警</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">选择左侧区域查看详情</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-400" />
            <h3 className="font-display font-bold text-lg gold-text">人员在岗状态</h3>
          </div>
          <span className="text-xs text-gray-500">共 {staff.length} 名员工</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {staff.map((s) => {
            const statusInfo = statusLabelMap[s.status] || statusLabelMap.off_duty;
            return (
              <div key={s.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-gold-500/20 transition-all group">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-imperial-900 font-bold shadow-gold-glow group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-imperial-800',
                      s.status === 'on_duty' && 'bg-emerald-400',
                      s.status !== 'on_duty' && 'bg-gray-500',
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-100 truncate">{s.name}</div>
                    <div className="text-[11px] text-gray-500 mb-1.5">{roleLabelMap[s.role] || s.role}</div>
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-md border text-[10px]',
                      statusInfo.className,
                    )}>
                      <Clock className="w-2.5 h-2.5 mr-1" />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
