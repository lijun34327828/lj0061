import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Castle,
  MapPin,
  Users,
  BedDouble,
  Percent,
  ArrowRight,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { fetchEstates } from '@/api';
import type { Estate } from '@/types';
import { cn } from '@/lib/utils';

export default function EstateList() {
  const [estates, setEstates] = useState<Estate[]>([]);

  useEffect(() => {
    fetchEstates().then(setEstates);
  }, []);

  const statusMap = {
    active: { label: '运营中', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30', icon: ShieldCheck },
    maintenance: { label: '维护中', className: 'bg-alert-medium/15 text-alert-medium border-alert-medium/30', icon: Wrench },
    closed: { label: '已关闭', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30', icon: Wrench },
  };

  return (
    <div className="space-y-6 animate-float-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl gold-text mb-1">全球庄园管理</h2>
          <p className="text-sm text-gray-500">Global Estates Directory & Management</p>
        </div>
        <div className="text-xs text-gray-500">
          共管理 <span className="gold-text font-bold text-sm">{estates.length}</span> 座庄园
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {estates.map((estate) => {
          const status = statusMap[estate.status] || statusMap.active;
          const StatusIcon = status.icon;
          return (
            <Link
              key={estate.id}
              to={`/estate/${estate.id}`}
              className={cn(
                'glass-card glass-card-hover p-6 group relative overflow-hidden block',
              )}
            >
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-gold-500/5 rounded-full blur-3xl group-hover:bg-gold-500/10 transition-all duration-500" />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400/30 via-gold-500/20 to-gold-600/30 border border-gold-500/30 flex items-center justify-center group-hover:shadow-gold-glow group-hover:scale-105 transition-all duration-300">
                    <Castle className="w-7 h-7 text-gold-400" strokeWidth={1.6} />
                  </div>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium',
                    status.className,
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl gold-text mb-1 group-hover:translate-x-0.5 transition-transform duration-300">
                  {estate.name}
                </h3>

                <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{estate.location?.city}, {estate.location?.country}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gold-400 mb-0.5">
                      <Users className="w-3 h-3" />
                    </div>
                    <div className="font-bold text-gray-100 text-lg">{estate.staffCount}</div>
                    <div className="text-[10px] text-gray-500">员工</div>
                  </div>
                  <div className="text-center border-x border-white/5">
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-0.5">
                      <BedDouble className="w-3 h-3" />
                    </div>
                    <div className="font-bold text-gray-100 text-lg">{estate.roomCount}</div>
                    <div className="text-[10px] text-gray-500">客房</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                      <Percent className="w-3 h-3" />
                    </div>
                    <div className="font-bold text-emerald-400 text-lg">{estate.occupancyRate}%</div>
                    <div className="text-[10px] text-gray-500">入住率</div>
                  </div>
                </div>

                <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"
                    style={{ width: `${estate.occupancyRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">今日开销</span>
                  <span className="text-sm gold-text font-bold">¥{(estate.todayExpense / 10000).toFixed(1)}万</span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">点击查看详情</span>
                  <div className="flex items-center gap-1 text-xs text-gold-400 font-medium group-hover:gap-2 transition-all duration-300">
                    进入庄园 <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
