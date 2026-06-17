import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Castle,
  Users,
  DollarSign,
  Percent,
  Clock,
  ArrowRight,
  AlertTriangle,
  Circle,
  CircleCheckBig,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import AlertBadge from '@/components/AlertBadge';
import { fetchDashboardSummary, fetchEstates, fetchAlerts, fetchTimeline } from '@/api';
import type { Estate, Alert, DashboardSummary, TimelineEvent } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [alerts, setLocalAlerts] = useState<Alert[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [hoveredEstate, setHoveredEstate] = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const { setAlerts: setStoreAlerts } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      const [s, e, a, t] = await Promise.all([
        fetchDashboardSummary(),
        fetchEstates(),
        fetchAlerts(),
        fetchTimeline(),
      ]);
      setSummary(s);
      setEstates(e);
      setLocalAlerts(a);
      setTimeline(t);
      setStoreAlerts(a);
    };
    loadData();
  }, [setStoreAlerts]);

  const formatNumber = (n: number) => {
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    return n.toLocaleString();
  };

  const pendingAlerts = alerts.filter((a) => a.status !== 'resolved').slice(0, 5);

  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CircleCheckBig className="w-4 h-4 text-emerald-400" />;
      case 'in_progress':
        return <Circle className="w-4 h-4 text-gold-400 animate-pulse" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const prioritySort = { high: 0, medium: 1, low: 2 };

  return (
    <div className="space-y-6 animate-float-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl gold-text mb-1">全球庄园总览</h2>
          <p className="text-sm text-gray-500">Global Estates Overview Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>最后更新：刚刚</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="庄园总数"
          value={summary?.totalEstates || 0}
          icon={Castle}
          trend={[{ label: '运营中', value: `${summary?.totalEstates || 0}/5`, positive: true }]}
          sparklineData={[
            { name: '周一', value: 5 }, { name: '周二', value: 5 }, { name: '周三', value: 5 },
            { name: '周四', value: 5 }, { name: '周五', value: 5 }, { name: '周六', value: 5 }, { name: '周日', value: 5 },
          ]}
        />
        <StatCard
          title="在岗人数"
          value={summary && summary.totalStaff > 0 ? `${Math.round((summary.staffOnDuty / summary.totalStaff) * 100)}%` : '0%'}
          icon={Users}
          trend={[
            { label: '在岗', value: `${summary?.staffOnDuty ?? 0}人`, positive: true },
            { label: '总数', value: `${summary?.totalStaff ?? 0}人`, positive: true },
          ]}
          sparklineData={[
            { name: '周一', value: 420 }, { name: '周二', value: 445 }, { name: '周三', value: 468 },
            { name: '周四', value: 480 }, { name: '周五', value: 475 }, { name: '周六', value: 482 }, { name: '周日', value: 489 },
          ]}
        />
        <StatCard
          title="今日开销"
          value={`¥${formatNumber(summary?.todayExpense || 0)}`}
          icon={DollarSign}
          trend={[{ label: '较昨日', value: '+8.6%', positive: false }]}
          sparklineData={[
            { name: '周一', value: 58 }, { name: '周二', value: 62 }, { name: '周三', value: 55 },
            { name: '周四', value: 68 }, { name: '周五', value: 72 }, { name: '周六', value: 65 }, { name: '周日', value: 71 },
          ]}
        />
        <StatCard
          title="全球入住率"
          value={`${summary?.occupancyRate || 0}%`}
          icon={Percent}
          trend={[
            { label: '入住', value: `${summary?.occupiedRooms || 0}间`, positive: true },
            { label: '总房', value: `${summary?.totalRooms || 0}间`, positive: true },
          ]}
          sparklineData={[
            { name: '周一', value: 72 }, { name: '周二', value: 75 }, { name: '周三', value: 68 },
            { name: '周四', value: 78 }, { name: '周五', value: 82 }, { name: '周六', value: 79 }, { name: '周日', value: 81 },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-lg gold-text">全球庄园分布</h3>
              <p className="text-xs text-gray-500 mt-0.5">点击标记点进入庄园详情</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-lg bg-white/5 text-gray-400">
              {estates.length} 座庄园
            </span>
          </div>

          <div className="relative w-full h-[480px] rounded-xl bg-imperial-900/40 border border-white/5 overflow-hidden">
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              <defs>
                <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a2744" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0d1525" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="landGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2f4470" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#243557" stopOpacity="0.4" />
                </linearGradient>
                <radialGradient id="pulseGrad">
                  <stop offset="0%" stopColor="#c9a962" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="1000" height="500" fill="url(#oceanGrad)" />

              <g fill="url(#landGrad)" stroke="#c9a962" strokeWidth="0.5" strokeOpacity="0.25">
                <path d="M150,180 Q180,140 250,130 Q300,120 340,150 Q370,180 350,220 Q320,260 280,270 Q240,275 200,260 Q160,245 150,220 Z" />
                <path d="M420,160 Q460,130 520,125 Q580,130 620,160 Q640,190 620,220 Q590,245 540,250 Q490,250 450,230 Q420,210 420,180 Z" />
                <path d="M680,140 Q750,110 830,120 Q890,140 910,180 Q920,230 880,260 Q830,280 780,270 Q730,260 700,230 Q670,200 670,170 Z" />
                <path d="M750,320 Q780,300 820,310 Q850,330 840,360 Q820,380 790,380 Q760,370 750,350 Z" />
                <path d="M200,350 Q240,330 290,340 Q330,360 320,395 Q300,420 260,425 Q220,415 200,390 Q190,370 200,350 Z" />
              </g>

              <g stroke="#c9a962" strokeOpacity="0.12" strokeWidth="0.5" fill="none" strokeDasharray="4 4">
                {[100, 200, 300, 400].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} />)}
                {[200, 400, 600, 800].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" />)}
              </g>

              {estates.map((estate) => {
                const mapPos = estate.mapPosition || { x: 50, y: 50 };
                const cx = mapPos.x * 10;
                const cy = mapPos.y * 10;
                const isHovered = hoveredEstate === estate.id;
                return (
                  <g key={`glow-${estate.id}`}>
                    <circle cx={cx} cy={cy} r="30" fill="url(#pulseGrad)" opacity={isHovered ? 1 : 0.5} className={cn(isHovered && 'animate-pulse-slow')} />
                  </g>
                );
              })}
            </svg>

            {estates.map((estate) => {
              const isHovered = hoveredEstate === estate.id;
              const mapPos = estate.mapPosition || { x: 50, y: 50 };
              return (
                <div
                  key={estate.id}
                  className="absolute z-20"
                  style={{ left: `${mapPos.x}%`, top: `${mapPos.y}%` }}
                  onMouseEnter={() => setHoveredEstate(estate.id)}
                  onMouseLeave={() => setHoveredEstate(null)}
                >
                  <Link to={`/estate/${estate.id}`} className="block">
                    <div className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full',
                      'bg-gradient-to-br from-gold-300 to-gold-600 shadow-gold-glow border-2 border-gold-100',
                      'transition-all duration-300',
                      isHovered && 'scale-150 animate-pulse-gold',
                    )} />

                    {isHovered && (
                      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-full -mt-6 min-w-[200px] glass-card p-3 animate-slide-in z-30 pointer-events-none">
                        <div className="font-display font-bold text-sm gold-text mb-1">{estate.name}</div>
                        <div className="text-xs text-gray-400 mb-2">{estate.location?.city}, {estate.location?.country}</div>
                        <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                          <div className="text-center">
                            <div className="font-bold text-gold-400">{estate.staffCount}</div>
                            <div className="text-gray-500">员工</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gold-400">{estate.roomCount}</div>
                            <div className="text-gray-500">客房</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-emerald-400">{estate.occupancyRate}%</div>
                            <div className="text-gray-500">入住</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-gold-400 font-medium pt-1 border-t border-white/5">
                          查看详情 <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg gold-text">今日接待安排</h3>
              <span className="text-xs text-gray-500">日程</span>
            </div>

            <div className="relative pl-6 space-y-5 max-h-[220px] overflow-y-auto scrollbar-thin pr-2">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-gold-500/50 via-gold-500/20 to-transparent" />

              {timeline.map((event, idx) => (
                <div key={event.id} className="relative">
                  <div
                    className={cn(
                      'absolute -left-[1px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      event.status === 'completed' && 'bg-emerald-500/20 border-emerald-400',
                      event.status === 'in_progress' && 'bg-gold-500/20 border-gold-400',
                      event.status === 'upcoming' && 'bg-gray-500/20 border-gray-500',
                    )}
                    style={{ left: '-22px' }}
                  >
                    {getStatusIcon(event.status)}
                  </div>

                  <div
                    className="glass-card glass-card-hover p-3 cursor-pointer"
                    style={{ borderLeft: `2px solid ${event.color}40` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-100">{event.time}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${event.color}30`, color: event.color }}
                      >
                        {event.estateName.slice(0, 4)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-100 mb-1">{event.title}</div>
                    <div className="text-xs text-gray-500 mb-2">{event.description}</div>
                    {event.progress > 0 && event.progress < 100 && (
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${event.progress}%`, backgroundColor: event.color }}
                        />
                      </div>
                    )}
                  </div>
                  {idx < timeline.length - 1 && <div className="h-2" />}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gold-400" />
                <h3 className="font-display font-bold text-lg gold-text">告警消息中心</h3>
              </div>
              <Link to="/alerts" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors">
                全部 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
              {pendingAlerts.sort((a, b) => prioritySort[a.priority] - prioritySort[b.priority]).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-xl transition-all duration-200 cursor-pointer',
                    expandedAlert === alert.id
                      ? 'bg-white/10 border border-gold-500/30'
                      : 'bg-white/[0.03] hover:bg-white/5 border border-transparent',
                  )}
                  onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 flex-shrink-0">
                      <AlertBadge priority={alert.priority} showLabel={false} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-sm font-medium text-gray-100 truncate">{alert.title}</span>
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded flex-shrink-0',
                          alert.status === 'handling' && 'bg-gold-500/15 text-gold-400',
                          alert.status === 'pending' && 'bg-alert-high/15 text-alert-high',
                        )}>
                          {alert.status === 'handling' ? '处理中' : '待处理'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{alert.estateName}</div>

                      {expandedAlert === alert.id && (
                        <div className="mt-2 pt-2 border-t border-white/5 space-y-2 animate-slide-in">
                          <p className="text-xs text-gray-400">{alert.description}</p>
                          <div className="flex items-center gap-2">
                            <button className="flex-1 text-[11px] px-2 py-1.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 text-imperial-900 font-medium hover:from-gold-500 hover:to-gold-400 transition-all">
                              立即处理
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
