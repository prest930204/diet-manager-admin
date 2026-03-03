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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-4 shadow-[4px_0_24px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-3 px-2 py-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            A
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin</h1>
            <p className="text-xs text-slate-500">Diet Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="대시보드"
            active={currentView === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
          />
          <NavItem
            icon={<Users size={20} />}
            label="회원 관리"
            active={currentView === 'users'}
            onClick={() => onViewChange('users')}
          />
        </nav>

        <div className="mt-auto">
          <NavItem
            icon={<LogOut size={20} />}
            label="로그아웃"
            onClick={() => window.location.reload()}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
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
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors",
        active
          ? "bg-indigo-50 text-indigo-600"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}
