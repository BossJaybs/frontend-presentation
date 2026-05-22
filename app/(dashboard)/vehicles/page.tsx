'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useData, Vehicle } from '@/contexts/data-context';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { VehicleTable } from '@/components/vehicles/vehicle-table';
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

export default function VehiclesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
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

  const handleAddVehicle = (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    addVehicle(data);
    setIsDialogOpen(false);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleUpdateVehicle = (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, data);
      setEditingVehicle(null);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      setIsDeleting(id);
      deleteVehicle(id);
      setIsDeleting(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVehicle(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage your fleet of vehicles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
              <DialogDescription>
                {editingVehicle
                  ? 'Update vehicle information'
                  : 'Create a new vehicle record'}
              </DialogDescription>
            </DialogHeader>
            <VehicleForm
              initialData={editingVehicle || undefined}
              onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle Table */}
      <VehicleTable
        vehicles={vehicles}
        onEdit={handleEditClick}
        onDelete={handleDeleteVehicle}
        isLoading={isDeleting !== null}
      />
    </div>
  );
}
