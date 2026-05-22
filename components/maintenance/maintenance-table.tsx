'use client';

import { useState } from 'react';
import { MaintenanceRecord, Vehicle } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MaintenanceTableProps {
  maintenance: MaintenanceRecord[];
  vehicles: Vehicle[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
  canDelete?: boolean;
}

export function MaintenanceTable({
  maintenance,
  vehicles,
  onDelete,
  isLoading = false,
  canDelete = false,
}: MaintenanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredMaintenance = maintenance.filter((record) => {
    const vehicle = vehicles.find(v => v.id === record.vehicleId);
    const vehicleInfo = vehicle ? `${vehicle.vehicleId} ${vehicle.plateNumber}` : '';
    const matchesSearch =
      vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || record.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      oil_change: 'bg-blue-100 text-blue-800',
      tire_repair: 'bg-yellow-100 text-yellow-800',
      inspection: 'bg-green-100 text-green-800',
      repair: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.vehicleId} - ${vehicle.plateNumber}` : 'Unknown Vehicle';
  };

  const formatType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const sortedMaintenance = [...filteredMaintenance].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoading}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="oil_change">Oil Change</SelectItem>
            <SelectItem value="tire_repair">Tire Repair</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Vehicle</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cost</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Notes</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedMaintenance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No maintenance records found
                  </td>
                </tr>
              ) : (
                sortedMaintenance.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {getVehicleInfo(record.vehicleId)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                        {formatType(record.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      ${record.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                      {record.notes || '-'}
                    </td>
                    {canDelete && (
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(record.id)}
                          disabled={isLoading}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count & Total Cost */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {sortedMaintenance.length} of {maintenance.length} records
        </p>
        <p className="text-sm font-medium text-foreground">
          Total Cost: <span className="text-primary">${sortedMaintenance.reduce((sum, m) => sum + m.cost, 0).toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}
