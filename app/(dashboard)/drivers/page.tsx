'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useData, Driver } from '@/contexts/data-context';
import { DriverForm } from '@/components/drivers/driver-form';
import { DriverTable } from '@/components/drivers/driver-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export default function DriversPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { drivers, vehicles, addDriver, updateDriver, deleteDriver } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Role protection - only admin and fleet manager can access
  if (user && !['admin', 'fleet_manager'].includes(user.role)) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  const handleAddDriver = (data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => {
    addDriver(data);
    setIsDialogOpen(false);
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver);
    setIsDialogOpen(true);
  };

  const handleUpdateDriver = (data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingDriver) {
      updateDriver(editingDriver.id, data);
      setEditingDriver(null);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      setIsDeleting(id);
      deleteDriver(id);
      setIsDeleting(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDriver(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Drivers</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Manage your fleet drivers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full md:w-auto">
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
              <DialogDescription>
                {editingDriver
                  ? 'Update driver information'
                  : 'Create a new driver record'}
              </DialogDescription>
            </DialogHeader>
            <DriverForm
              initialData={editingDriver || undefined}
              vehicles={vehicles}
              onSubmit={editingDriver ? handleUpdateDriver : handleAddDriver}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Driver Table */}
      <DriverTable
        drivers={drivers}
        vehicles={vehicles}
        onEdit={handleEditClick}
        onDelete={handleDeleteDriver}
        isLoading={isDeleting !== null}
      />
    </div>
  );
}
