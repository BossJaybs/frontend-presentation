'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData, MaintenanceRecord } from '@/contexts/data-context';
import { MaintenanceForm } from '@/components/maintenance/maintenance-form';
import { MaintenanceTable } from '@/components/maintenance/maintenance-table';
import { Card } from '@/components/ui/card';
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

const SERVICE_PRICE_GUIDE: Record<string, string> = {
  oil_change: '$80 - $180',
  tire_repair: '$60 - $250',
  inspection: '$50 - $120',
  repair: '$150 - $900',
  other: '$100 - $400',
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const { maintenance, vehicles, addMaintenanceRecord, deleteMaintenanceRecord } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Determine if user can edit/delete maintenance records
  const canEdit = user && ['admin', 'fleet_manager'].includes(user.role);

  const handleAddMaintenance = (data: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => {
    addMaintenanceRecord(data);
    setIsDialogOpen(false);
  };

  const handleDeleteMaintenance = (id: string) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      setIsDeleting(id);
      deleteMaintenanceRecord(id);
      setIsDeleting(null);
    }
  };

  // Calculate statistics
  const totalCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const averageCost = maintenance.length > 0 ? totalCost / maintenance.length : 0;
  const maintenanceByType: Record<string, number> = {};
  
  maintenance.forEach(m => {
    maintenanceByType[m.type] = (maintenanceByType[m.type] || 0) + 1;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Maintenance</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Track vehicle maintenance and repairs</p>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full md:w-auto">
                <Plus className="w-4 h-4" />
                Add Record
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Maintenance Record</DialogTitle>
              <DialogDescription>
                Create a new maintenance or repair record for a vehicle
              </DialogDescription>
            </DialogHeader>
            <MaintenanceForm
              vehicles={vehicles}
              onSubmit={handleAddMaintenance}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Total Records</p>
          <p className="text-3xl font-bold text-foreground mt-2">{maintenance.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-3xl font-bold text-primary mt-2">${totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Average Cost</p>
          <p className="text-3xl font-bold text-foreground mt-2">${averageCost.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Types of Maintenance</p>
          <p className="text-3xl font-bold text-foreground mt-2">{Object.keys(maintenanceByType).length}</p>
        </div>
      </div>

      {/* Price Guide */}
      <div className="mb-8">
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Service Price Guide</h2>
            <p className="text-sm text-muted-foreground">Quick reference ranges for common vehicle service and repair categories.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(SERVICE_PRICE_GUIDE).map(([type, priceRange]) => (
              <div key={type} className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground capitalize">{type.replace('_', ' ')}</p>
                <p className="mt-1 text-lg font-semibold text-primary">{priceRange}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Maintenance Table */}
      <MaintenanceTable
        maintenance={maintenance}
        vehicles={vehicles}
        onDelete={handleDeleteMaintenance}
        isLoading={isDeleting !== null}
        canDelete={!!canEdit}
      />
    </div>
  );
}
