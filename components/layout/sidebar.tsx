'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Truck,
  Users,
  Wrench,
  FileText,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  MapPin,
  Shield,
  CheckCircle,
  ClipboardCheck,
} from 'lucide-react';
import { FleetIcon } from '@/components/icons/fleet-icon';
import { cn } from '@/lib/utils';
import { getMenuItemsByRole, getRoleLabel } from '@/lib/role-permissions';

const ICON_MAP = {
  BarChart3,
  Truck,
  Users,
  Wrench,
  FileText,
  AlertTriangle,
  MapPin,
  Shield,
  CheckCircle,
  ClipboardCheck,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - visible only on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="sm"
          className="bg-sidebar/95 text-sidebar-foreground hover:bg-sidebar-accent/30"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:relative w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col top-0 border-r border-sidebar-border/30 z-40 transition-transform duration-300 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
      {/* Logo Section */}
      <div className="px-6 py-7 border-b border-sidebar-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sidebar-primary to-accent flex items-center justify-center shadow-lg">
            <FleetIcon />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">Group 4 FVMS</div>
            <div className="text-xs text-sidebar-foreground/60">Vehicle Management</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-8 space-y-1">
        {user && getMenuItemsByRole(user.role).map((item) => {
          const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border/30 p-4 space-y-4">
        <div className="px-2 space-y-2">
          <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-widest">Account</p>
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
          <div className="inline-flex px-2 py-1 bg-sidebar-accent/20 rounded-lg">
            <p className="text-xs font-medium text-sidebar-primary">{user && getRoleLabel(user.role)}</p>
          </div>
        </div>
        <Button
          onClick={logout}
          className="w-full justify-start gap-2 bg-transparent text-sidebar-foreground hover:bg-sidebar-accent/30 border-0"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign Out
        </Button>
      </div>
    </aside>
    </>
  );
}
