import { ReactNode } from 'react';
import { View } from '../App';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar / Topbar on Mobile */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-row md:flex-col p-2 md:p-4 shadow-sm md:shadow-[4px_0_24px_rgb(0,0,0,0.02)] sticky top-0 z-50">
        <div className="flex items-center gap-3 px-2 py-2 md:py-4 md:mb-8 shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-sm">
            A
          </div>
          <div className="hidden md:block">
            <h1 className="font-bold text-lg leading-tight">Admin</h1>
            <p className="text-xs text-slate-500">Diet Manager</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-row md:flex-col gap-1 md:gap-2 overflow-x-auto md:space-y-2 ml-2 md:ml-0 items-center md:items-stretch">
          <NavItem
            icon={<LayoutDashboard size={20} className="shrink-0" />}
            label="대시보드"
            active={currentView === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
          />
          <NavItem
            icon={<Users size={20} className="shrink-0" />}
            label="회원 관리"
            active={currentView === 'users'}
            onClick={() => onViewChange('users')}
          />
        </nav>

        <div className="mt-auto hidden md:block">
          <NavItem
            icon={<LogOut size={20} />}
            label="로그아웃"
            onClick={() => window.location.reload()}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
          />
        </div>
        
        {/* Mobile Logout Button */}
        <button 
          onClick={() => window.location.reload()}
          className="md:hidden p-2 text-slate-500 hover:text-red-600 ml-2 shrink-0"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  className,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-auto md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl text-sm font-medium transition-colors whitespace-nowrap",
        active
          ? "bg-indigo-50 text-indigo-600"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
