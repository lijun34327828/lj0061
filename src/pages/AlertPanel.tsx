import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Filter,
  Search,
  Clock,
  User,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Wrench,
  Users,
  ShieldCheck,
  Wallet,
  Send,
  MapPin,
} from 'lucide-react';
import AlertBadge from '@/components/AlertBadge';
import { fetchAlerts, fetchEstateStaff, handleAlert as handleAlertApi } from '@/api';
import type { Alert, AlertPriority, AlertStatus, AlertType, Staff } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const priorityOptions: { value: AlertPriority | 'all'; label: string; className: string }[] = [
  { value: 'all', label: '全部优先级', className: 'text-gray-400' },
  { value: 'high', label: '紧急', className: 'text-alert-high' },
  { value: 'medium', label: '重要', className: 'text-alert-medium' },
  { value: 'low', label: '一般', className: 'text-alert-low' },
];

const typeOptions: { value: AlertType | 'all'; label: string; icon: typeof Package }[] = [
  { value: 'all', label: '全部类型', icon: Filter },
  { value: 'inventory', label: '物资库存', icon: Package },
  { value: 'equipment', label: '设备故障', icon: Wrench },
  { value: 'staff', label: '人员排班', icon: Users },
  { value: 'security', label: '安全警戒', icon: ShieldCheck },
  { value: 'finance', label: '财务预警', icon: Wallet },
];

const statusOptions: { value: AlertStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'handling', label: '处理中' },
  { value: 'resolved', label: '已解决' },
];

const statusLabelMap: Record<AlertStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: '待处理', className: 'bg-alert-high/15 text-alert-high border-alert-high/30', icon: Clock },
  handling: { label: '处理中', className: 'bg-alert-medium/15 text-alert-medium border-alert-medium/30', icon: Users },
  resolved: { label: '已解决', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30', icon: CheckCircle },
};

const typeIconMap: Record<AlertType, typeof Package> = {
  inventory: Package,
  equipment: Wrench,
  staff: Users,
  security: ShieldCheck,
  finance: Wallet,
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function AlertPanel() {
  const { alerts: storeAlerts, setAlerts: setStoreAlerts, updateAlert: updateStoreAlert } = useAppStore();
  const [alerts, setLocalAlerts] = useState<Alert[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<AlertPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const [handlingAlertId, setHandlingAlertId] = useState<string | null>(null);
  const [selectedHandler, setSelectedHandler] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [a, s] = await Promise.all([fetchAlerts(), fetchEstateStaff('estate-1')]);
        const safeAlerts = Array.isArray(a) ? a : [];
        const safeStaff = Array.isArray(s) ? s : [];
        setLocalAlerts(safeAlerts);
        setStaff(safeStaff);
        setStoreAlerts(safeAlerts);
      } catch (err) {
        console.error('Failed to load alert data:', err);
        setError(err instanceof Error ? err.message : '加载失败');
        setLocalAlerts([]);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setStoreAlerts]);

  const safeStoreAlerts = Array.isArray(storeAlerts) ? storeAlerts : [];
  const allAlerts = safeStoreAlerts.length > 0 ? safeStoreAlerts : alerts;

  const validAlerts = allAlerts.filter((a) =>
    a && typeof a === 'object' &&
    typeof a.id === 'string' &&
    typeof a.title === 'string' &&
    typeof a.status === 'string' &&
    typeof a.priority === 'string' &&
    typeof a.type === 'string'
  );

  const counts = {
    high: validAlerts.filter((a) => a.priority === 'high' && a.status !== 'resolved').length,
    medium: validAlerts.filter((a) => a.priority === 'medium' && a.status !== 'resolved').length,
    low: validAlerts.filter((a) => a.priority === 'low' && a.status !== 'resolved').length,
  };

  const filteredAlerts = validAlerts
    .filter((a) => priorityFilter === 'all' || a.priority === priorityFilter)
    .filter((a) => typeFilter === 'all' || a.type === typeFilter)
    .filter((a) => statusFilter === 'all' || a.status === statusFilter)
    .filter((a) => !search || a.title.includes(search) || a.description?.includes(search) || (a.estateName?.includes(search)))
    .sort((a, b) => {
      const ps: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const pa = ps[a.priority] ?? 99;
      const pb = ps[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

  const openHandle = (alertId: string) => {
    setHandlingAlertId(alertId);
    setSelectedHandler('');
    setNote('');
  };

  const closeHandle = () => {
    setHandlingAlertId(null);
  };

  const submitHandle = async () => {
    if (!handlingAlertId || !selectedHandler) return;
    const handler = staff.find((s) => s.id === selectedHandler);
    const updated: Partial<Alert> = {
      status: 'handling',
      handlerId: selectedHandler,
      handlerName: handler?.name,
      updatedAt: new Date().toISOString(),
    };
    updateStoreAlert(handlingAlertId, updated);
    setLocalAlerts((prev) => prev.map((a) => (a.id === handlingAlertId ? { ...a, ...updated } : a)));
    try {
      await handleAlertApi({ id: handlingAlertId, handlerId: selectedHandler, note });
    } catch {
      // ignore
    }
    closeHandle();
  };

  return (
    <div className="space-y-6 animate-float-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl gold-text mb-1">物资告警中心</h2>
          <p className="text-sm text-gray-500">Alert Management & Incident Response</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['high', 'medium', 'low'] as AlertPriority[]).map((p) => (
          <div key={p} className={cn(
            'glass-card p-5 relative overflow-hidden',
            p === 'high' && 'border-l-4 border-l-alert-high',
            p === 'medium' && 'border-l-4 border-l-alert-medium',
            p === 'low' && 'border-l-4 border-l-alert-low',
          )}>
            <div className="flex items-start justify-between">
              <div>
                <AlertBadge priority={p} size="lg" withAnimation={p !== 'low'} />
                <div className="mt-3">
                  <div className={cn(
                    'font-display font-black text-4xl tracking-tight',
                    p === 'high' && 'text-alert-high',
                    p === 'medium' && 'text-alert-medium',
                    p === 'low' && 'text-alert-low',
                  )}>
                    {counts[p]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p === 'high' && '需要立即响应'}
                    {p === 'medium' && '4小时内处理'}
                    {p === 'low' && '24小时内处理'}
                  </div>
                </div>
              </div>
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                p === 'high' && 'bg-alert-high/10',
                p === 'medium' && 'bg-alert-medium/10',
                p === 'low' && 'bg-alert-low/10',
              )}>
                <AlertTriangle className={cn(
                  'w-7 h-7',
                  p === 'high' && 'text-alert-high animate-blink',
                  p === 'medium' && 'text-alert-medium animate-pulse',
                  p === 'low' && 'text-alert-low',
                )} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0 ml-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索告警标题、描述、庄园..."
              className="flex-1 px-3 py-2 bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as AlertPriority | 'all')}
              className="input-field text-sm w-32"
            >
              {priorityOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AlertType | 'all')}
              className="input-field text-sm w-36"
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
              className="input-field text-sm w-32"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-xs text-gray-500">
            共 <span className="gold-text font-bold text-sm">{filteredAlerts.length}</span> 条告警
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-gray-500">加载中...</div>
        ) : error ? (
          <div className="glass-card p-16 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-alert-high opacity-60" />
            <div className="text-lg font-medium text-gray-300 mb-1">加载失败</div>
            <div className="text-sm text-gray-500 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-gold-600 to-gold-500 text-imperial-900 hover:from-gold-500 hover:to-gold-400 transition-all"
            >
              重新加载
            </button>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-40" />
            <div className="text-lg font-medium text-gray-400 mb-1">暂无匹配的告警</div>
            <div className="text-sm text-gray-600">当前筛选条件下没有告警记录</div>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const priorityCfg = priorityOptions.find((p) => p.value === alert.priority);
            const statusCfg = statusLabelMap[alert.status as AlertStatus] || statusLabelMap.pending;
            const TypeIcon = typeIconMap[alert.type as AlertType] || AlertTriangle;
            const isExpanded = expandedAlert === alert.id;
            const isHandling = handlingAlertId === alert.id;
            const prioritySortIdx = ({ high: 0, medium: 1, low: 2 } as Record<string, number>)[alert.priority] ?? 99;

            return (
              <div
                key={alert.id}
                className={cn(
                  'glass-card overflow-hidden transition-all duration-300',
                  isExpanded && 'ring-1 ring-gold-500/30',
                )}
              >
                <div
                  className="flex items-stretch cursor-pointer group"
                  onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                >
                  <div className={cn(
                    'w-1.5 flex-shrink-0',
                    alert.priority === 'high' && prioritySortIdx === 0 && 'bg-alert-high',
                    alert.priority === 'medium' && 'bg-alert-medium',
                    alert.priority === 'low' && 'bg-alert-low',
                  )} />

                  <div className="flex-1 min-w-0 p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                        alert.priority === 'high' && 'bg-alert-high/15',
                        alert.priority === 'medium' && 'bg-alert-medium/15',
                        alert.priority === 'low' && 'bg-alert-low/15',
                      )}>
                        <TypeIcon className={cn(
                          'w-5 h-5',
                          alert.priority === 'high' && 'text-alert-high animate-pulse',
                          alert.priority === 'medium' && 'text-alert-medium',
                          alert.priority === 'low' && 'text-alert-low',
                        )} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <AlertBadge priority={alert.priority} size="sm" />
                          <span className={cn('status-badge border', statusCfg.className)}>
                            <statusCfg.icon className="w-3 h-3 mr-1" />
                            {statusCfg.label}
                          </span>
                          {alert.handlerName && (
                            <span className="status-badge bg-gold-500/10 text-gold-400 border border-gold-500/20">
                              <User className="w-3 h-3 mr-1" />
                              {alert.handlerName}
                            </span>
                          )}
                        </div>

                        <div className="text-base font-medium text-gray-100 mb-1 group-hover:text-gold-400 transition-colors">
                          {alert.title}
                        </div>
                        <p className={cn(
                          'text-sm text-gray-400 leading-relaxed transition-all duration-300',
                          !isExpanded && 'line-clamp-1',
                        )}>
                          {alert.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.estateName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span title={formatDateTime(alert.createdAt)}>{timeAgo(alert.createdAt)}</span>
                          </div>
                          {alert.resolvedAt && (
                            <div className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle className="w-3 h-3" />
                              <span>解决于 {timeAgo(alert.resolvedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openHandle(alert.id);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gold-600 to-gold-500 text-imperial-900 hover:from-gold-500 hover:to-gold-400 transition-all shadow-gold-glow"
                          >
                            处理
                          </button>
                        )}
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-transform',
                          isExpanded && 'rotate-180 bg-white/10',
                        )}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gold-400" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in">
                        <div className="p-3 rounded-xl bg-white/[0.03]">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">告警ID</div>
                          <div className="text-sm text-gray-200 font-mono">{alert.id.toUpperCase()}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03]">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">告警类型</div>
                          <div className="text-sm text-gray-200 flex items-center gap-1.5">
                            <TypeIcon className="w-4 h-4 text-gold-400" />
                            {typeOptions.find((t) => t.value === alert.type)?.label || alert.type}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03]">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">创建时间</div>
                          <div className="text-sm text-gray-200">{formatDateTime(alert.createdAt)}</div>
                        </div>

                        {isHandling && (
                          <div className="md:col-span-3 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20 animate-slide-in">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-sm gold-text">处理告警</h5>
                              <button onClick={closeHandle} className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 mb-1.5 block">指定处理人</label>
                                <select
                                  value={selectedHandler}
                                  onChange={(e) => setSelectedHandler(e.target.value)}
                                  className="input-field text-sm"
                                >
                                  <option value="">请选择处理人员</option>
                                  {staff.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} — {
                                      { butler: '管家', security: '安保', logistics: '后勤', chef: '主厨', gardener: '园艺师', driver: '司机' }[s.role] || s.role
                                    }</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-end">
                                <button
                                  onClick={submitHandle}
                                  disabled={!selectedHandler}
                                  className={cn(
                                    'w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                                    selectedHandler
                                      ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-imperial-900 hover:from-gold-500 hover:to-gold-400 shadow-gold-glow'
                                      : 'bg-white/5 text-gray-500 cursor-not-allowed',
                                  )}
                                >
                                  <Send className="w-4 h-4" />
                                  提交处理
                                </button>
                              </div>
                              <div className="md:col-span-3">
                                <label className="text-xs text-gray-500 mb-1.5 block">处理备注</label>
                                <textarea
                                  value={note}
                                  onChange={(e) => setNote(e.target.value)}
                                  placeholder="记录处理方案和注意事项（可选）..."
                                  rows={2}
                                  className="input-field text-sm resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
