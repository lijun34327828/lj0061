import { type LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { label: string; value: string; positive: boolean }[];
  sparklineData?: { name: string; value: number }[];
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  sparklineData,
  className,
}: StatCardProps) {
  return (
    <div className={cn(
      'glass-card glass-card-hover p-5 relative overflow-hidden group',
      className,
    )}>
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-all duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-display font-black text-3xl gold-text tracking-tight">
              {value}
            </span>
          </div>
          
          {trend && trend.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {trend.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500">{t.label}</span>
                  <span className={cn(
                    'font-medium',
                    t.positive ? 'text-emerald-400' : 'text-alert-high',
                  )}>
                    {t.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 group-hover:shadow-gold-glow transition-all duration-300">
          <Icon className="w-6 h-6 text-gold-400" strokeWidth={1.8} />
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-16 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a962" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#c9a962" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 39, 68, 0.95)',
                  border: '1px solid rgba(201, 169, 98, 0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f3f4f6',
                }}
                labelStyle={{ color: '#c9a962', marginBottom: '4px' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#c9a962"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#c9a962', stroke: '#1a2744', strokeWidth: 2 }}
                fill={`url(#spark-${title})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
