import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'fleet_manager' | 'driver';
}

export interface AuthToken {
  user: AuthUser;
  iat: number;
  exp: number;
}

const SECRET_KEY = 'fleettrack_secret_key_not_for_production';

// Mock credentials for demo
const DEMO_USERS = [
  { id: 'usr_1', email: 'admin@group4fvms.com', password: 'admin123', role: 'admin' as const },
  { id: 'usr_2', email: 'manager@group4fvms.com', password: 'manager123', role: 'fleet_manager' as const },
  { id: 'usr_3', email: 'driver@group4fvms.com', password: 'driver123', role: 'driver' as const },
];

export function generateToken(user: AuthUser): string {
  const payload: AuthToken = {
    user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  };
  
  // Simple base64 encoding (not cryptographically secure - for demo only)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const now = Math.floor(Date.now() / 1000);
    
    if (decoded.exp && decoded.exp < now) {
      return null; // Token expired
    }
    
    return decoded;
  } catch (e) {
    return null;
  }
}

export function validateLogin(email: string, password: string): AuthUser | null {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
  
  return null;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('group4fvms_token');
  if (!token) return null;
  
  const decoded = verifyToken(token);
  return decoded?.user || null;
}

export function setAuthToken(user: AuthUser) {
  const token = generateToken(user);
  localStorage.setItem('group4fvms_token', token);
  localStorage.setItem('group4fvms_user', JSON.stringify(user));
}

export function clearAuthToken() {
  localStorage.removeItem('group4fvms_token');
  localStorage.removeItem('group4fvms_user');
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const user = localStorage.getItem('group4fvms_user');
  return user ? JSON.parse(user) : null;
}

export function logActivity(action: string, description: string) {
  const user = getCurrentUser();
  if (!user) return;
  
  const activity = {
    id: `act_${Date.now()}`,
    userId: user.id,
    action,
    description,
    timestamp: new Date().toISOString(),
  };
  
  const activities = JSON.parse(localStorage.getItem('group4fvms_activities') || '[]');
  activities.unshift(activity);
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.pop();
  }
  localStorage.setItem('group4fvms_activities', JSON.stringify(activities));
}

export function getActivityLog(limit: number = 10) {
  if (typeof window === 'undefined') return [];
  
  const activities = JSON.parse(localStorage.getItem('group4fvms_activities') || '[]');
  return activities.slice(0, limit);
}
