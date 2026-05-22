'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Driver, Vehicle } from '@/contexts/data-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DriverFormProps {
  initialData?: Driver;
  vehicles: Vehicle[];
  onSubmit: (data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DriverForm({
  initialData,
  vehicles,
  onSubmit,
  onCancel,
  isLoading = false,
}: DriverFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    licenseNumber: initialData?.licenseNumber || '',
    contactNumber: initialData?.contactNumber || '',
    assignedVehicleId: initialData?.assignedVehicleId || '',
    status: initialData?.status || ('active' as const),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.licenseNumber ||
      !formData.contactNumber
    ) {
      return;
    }

    onSubmit({
      name: formData.name,
      licenseNumber: formData.licenseNumber,
      contactNumber: formData.contactNumber,
      assignedVehicleId: formData.assignedVehicleId || null,
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Full Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">License Number</label>
          <Input
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            placeholder="DL123456"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Contact Number</label>
          <Input
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            placeholder="+1-555-0101"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Status</label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
            <SelectTrigger disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-foreground">Assigned Vehicle (Optional)</label>
          <Select 
            value={formData.assignedVehicleId || 'none'} 
            onValueChange={(value) => setFormData({ ...formData, assignedVehicleId: value === 'none' ? '' : value })}
          >
            <SelectTrigger disabled={isLoading}>
              <SelectValue placeholder="Select a vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleId} - {vehicle.plateNumber} ({vehicle.brand} {vehicle.model})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Driver'}
        </Button>
      </div>
    </form>
  );
}
