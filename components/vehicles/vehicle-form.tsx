'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Vehicle } from '@/contexts/data-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VehicleFormProps {
  initialData?: Vehicle;
  onSubmit: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VehicleForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: VehicleFormProps) {
  const [formData, setFormData] = useState({
    vehicleId: initialData?.vehicleId || '',
    plateNumber: initialData?.plateNumber || '',
    model: initialData?.model || '',
    brand: initialData?.brand || '',
    year: initialData?.year.toString() || new Date().getFullYear().toString(),
    fuelConsumption: initialData?.fuelConsumption?.toString() || '',
    status: initialData?.status || ('active' as const),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.vehicleId ||
      !formData.plateNumber ||
      !formData.model ||
      !formData.brand
    ) {
      return;
    }

    onSubmit({
      vehicleId: formData.vehicleId,
      plateNumber: formData.plateNumber,
      model: formData.model,
      brand: formData.brand,
      year: parseInt(formData.year),
      fuelConsumption: parseFloat(formData.fuelConsumption) || 0,
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Vehicle ID</label>
          <Input
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            placeholder="FL-001"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Plate Number</label>
          <Input
            value={formData.plateNumber}
            onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
            placeholder="ABC-123"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Brand</label>
          <Input
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="Ford"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Model</label>
          <Input
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="F-150"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Year</label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Fuel Consumption (L / 100 km)</label>
          <Input
            type="number"
            step="0.1"
            value={formData.fuelConsumption}
            onChange={(e) => setFormData({ ...formData, fuelConsumption: e.target.value })}
            placeholder="e.g. 12.5"
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
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Vehicle'}
        </Button>
      </div>
    </form>
  );
}
