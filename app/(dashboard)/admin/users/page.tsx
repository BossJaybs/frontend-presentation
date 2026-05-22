'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Trash2, Lock, Unlock } from 'lucide-react';

// Mock user data - in real app this would come from database
interface UserAccount {
  id: string;
  email: string;
  role: 'admin' | 'fleet_manager' | 'driver';
  status: 'active' | 'suspended';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'usr_1', email: 'admin@group4fvms.com', role: 'admin', status: 'active', createdAt: '2024-01-01' },
    { id: 'usr_2', email: 'manager@group4fvms.com', role: 'fleet_manager', status: 'active', createdAt: '2024-01-05' },
    { id: 'usr_3', email: 'driver@group4fvms.com', role: 'driver', status: 'active', createdAt: '2024-01-10' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'driver' });

  // Admin-only access check
  if (user?.role !== 'admin') {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">Only administrators can access this page.</p>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  const handleAddUser = () => {
    if (!formData.email) return;
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: formData.email,
      role: formData.role as any,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    setFormData({ email: '', role: 'driver' });
    setShowForm(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      alert('Cannot delete your own account');
      return;
    }
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
        : u
    ));
  };

  const getRoleColor = (role: string) => {
    if (role === 'admin') return 'bg-red-500/20 text-red-700 dark:text-red-400';
    if (role === 'fleet_manager') return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
    return 'bg-green-500/20 text-green-700 dark:text-green-400';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage system users, roles, and permissions</p>
        </div>
      </div>

      {/* Add User Form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          Add New User
        </Button>
      ) : (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Create New User</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@group4fvms.com"
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
            >
              <option value="driver">Driver</option>
              <option value="fleet_manager">Fleet Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddUser} className="flex-1">Create User</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </Card>
      )}

      {/* Users List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">System Users ({users.length})</h2>
        <div className="space-y-2">
          {users.map(userAccount => (
            <Card key={userAccount.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{userAccount.email}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className={`px-2 py-1 rounded font-medium ${getRoleColor(userAccount.role)}`}>
                      {userAccount.role.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      userAccount.status === 'active'
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                        : 'bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                      {userAccount.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(userAccount.id)}
                    className="gap-1"
                  >
                    {userAccount.status === 'active' ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Suspend
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </Button>
                  {userAccount.id !== user?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(userAccount.id)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* System Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">System Settings</h2>
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">Security Policies</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Minimum password length: 8 characters</p>
              <p>• Password complexity: Required (uppercase, lowercase, numbers)</p>
              <p>• Session timeout: 30 minutes of inactivity</p>
              <p>• Two-factor authentication: Optional</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">Configure Security</Button>
        </Card>
      </div>
    </div>
  );
}
