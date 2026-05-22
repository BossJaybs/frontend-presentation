'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaintenanceRecord, Vehicle } from '@/contexts/data-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MaintenanceFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MaintenanceForm({
  vehicles,
  onSubmit,
  onCancel,
  isLoading = false,
}: MaintenanceFormProps) {
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'oil_change' as const,
    date: new Date().toISOString().split('T')[0],
    cost: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.date || !formData.cost) {
      return;
    }

    onSubmit({
      vehicleId: formData.vehicleId,
      type: formData.type,
      date: formData.date,
      cost: parseFloat(formData.cost),
      notes: formData.notes,
    });

    setFormData({
      vehicleId: '',
      type: 'oil_change',
      date: new Date().toISOString().split('T')[0],
      cost: '',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Vehicle</label>
          <Select value={formData.vehicleId} onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}>
            <SelectTrigger disabled={isLoading} required>
              <SelectValue placeholder="Select a vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleId} - {vehicle.plateNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Maintenance Type</label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oil_change">Oil Change</SelectItem>
              <SelectItem value="tire_repair">Tire Repair</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Cost</label>
          <Input
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="0.00"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-foreground">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add maintenance notes or details..."
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Add Maintenance Record'}
        </Button>
      </div>
    </form>
  );
}
