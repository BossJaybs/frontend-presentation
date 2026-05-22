export type UserRole = 'admin' | 'fleet_manager' | 'driver';

export interface MenuPermission {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

export const MENU_PERMISSIONS: MenuPermission[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'BarChart3', roles: ['admin', 'fleet_manager', 'driver'] },
  { label: 'Vehicles', href: '/vehicles', icon: 'Truck', roles: ['admin', 'fleet_manager'] },
  { label: 'Drivers', href: '/drivers', icon: 'Users', roles: ['admin', 'fleet_manager'] },
  { label: 'Maintenance', href: '/maintenance', icon: 'Wrench', roles: ['admin', 'fleet_manager', 'driver'] },
  { label: 'Reports', href: '/reports', icon: 'FileText', roles: ['admin', 'fleet_manager'] },
  { label: 'Inspections', href: '/admin/inspections', icon: 'ClipboardCheck', roles: ['admin'] },
  { label: 'Monitoring', href: '/manager/monitoring', icon: 'MapPin', roles: ['admin', 'fleet_manager'] },
  { label: 'Review', href: '/manager/incidents-review', icon: 'CheckCircle', roles: ['admin', 'fleet_manager'] },
  { label: 'Users', href: '/admin/users', icon: 'Shield', roles: ['admin'] },
  { label: 'My Trips', href: '/driver/trips', icon: 'Truck', roles: ['driver'] },
  { label: 'My Inspections', href: '/driver/inspections', icon: 'ClipboardCheck', roles: ['driver'] },
  { label: 'Incidents', href: '/driver/incidents', icon: 'AlertTriangle', roles: ['driver'] },
];

export function getMenuItemsByRole(role: UserRole): MenuPermission[] {
  return MENU_PERMISSIONS.filter((item) => item.roles.includes(role));
}

export function canAccessPage(userRole: UserRole, page: string): boolean {
  const allowedPages = getMenuItemsByRole(userRole);
  return allowedPages.some((item) => item.href === page);
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Administrator',
    fleet_manager: 'Fleet Manager',
    driver: 'Driver',
  };
  return labels[role];
}
