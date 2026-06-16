import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Castle,
  CalendarClock,
  BedDouble,
  Bell,
  Crown,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/estates', icon: Castle, label: '庄园管理' },
  { path: '/scheduling', icon: CalendarClock, label: '排班中心' },
  { path: '/rooms', icon: BedDouble, label: '客房调度' },
  { path: '/alerts', icon: Bell, label: '告警面板' },
];

export default function Layout() {
  const location = useLocation();
  const { sidebarExpanded, toggleSidebar, setSidebarExpanded, wsConnected, alerts } = useAppStore();
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const highAlerts = safeAlerts.filter((a) => a.priority === 'high' && a.status !== 'resolved').length;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          'h-full flex flex-col bg-imperial-900/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-in-out z-20',
          sidebarExpanded ? 'w-60' : 'w-16',
        )}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-glow flex-shrink-0">
              <Crown className="w-5 h-5 text-imperial-900" />
            </div>
            {sidebarExpanded && (
              <span className="font-display font-bold text-lg gold-text whitespace-nowrap overflow-hidden">
                皇家庄园
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/' || location.pathname.startsWith('/estate/')
              : location.pathname.startsWith(item.path);
            const hasBadge = item.path === '/alerts' && highAlerts > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => toggleSidebar()}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-400 border border-gold-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-100',
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded-r-full" />
                )}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                  isActive ? 'bg-gold-500/20' : 'bg-white/5 group-hover:bg-white/10',
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                {sidebarExpanded && (
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
                {hasBadge && (
                  <span className={cn(
                    'ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-alert-high text-white text-xs font-bold flex items-center justify-center animate-blink',
                    !sidebarExpanded && 'absolute -top-1 -right-1',
                  )}>
                    {highAlerts > 9 ? '9+' : highAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5',
            !sidebarExpanded && 'justify-center',
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full flex-shrink-0',
              wsConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-500',
            )} />
            {sidebarExpanded && (
              <div className="flex items-center gap-2 text-xs text-gray-400 overflow-hidden">
                {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span className="whitespace-nowrap">{wsConnected ? '实时连接中' : '离线模式'}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-imperial-900/60 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-bold text-xl gold-text">
              全球庄园管理可视化系统
            </h1>
            <span className="text-xs text-gray-500 px-2 py-1 rounded-md bg-white/5">
              Imperial Estate Management System
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-gold-500/30 transition-all group">
              <Bell className="w-4 h-4 text-gray-400 group-hover:text-gold-400 transition-colors" />
              {highAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-alert-high text-white text-xs font-bold flex items-center justify-center animate-blink">
                  {highAlerts > 9 ? '9+' : highAlerts}
                </span>
              )}
            </button>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-100">首席执行官</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 flex items-center justify-center shadow-gold-glow">
                <User className="w-5 h-5 text-imperial-900" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
